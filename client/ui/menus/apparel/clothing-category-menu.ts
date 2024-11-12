import { GetTextLabelForLocate, PedComponents } from "constants/clothing";
import { store } from "state";
import { CharacterStore } from "state/character-store";
import { clothingStore, PedClothing } from "state/clothing-store";
import { Menu, MenuPool, NativeUI } from "ui";
import { iterateDrawables } from "./stupid-drawable-index-fix";

export function createClothingCategorySubmenu(menuPool: MenuPool, parentMenu: Menu, pedComponents: PedClothing, componentsToInclude: ReadonlyArray<keyof PedClothing>, offsets: ReadonlyArray<Record<string, number>> = []) {
    const playerPedEntity = PlayerPedId();

    let skipped = 0;

    const topsMenus = componentsToInclude.reduce((menus, compGroup, compIndex) => {
        const comps = pedComponents[compGroup];
        iterateDrawables(comps, (drawableId, _, textures) => {
            if (IsPedComponentVariationGen9Exclusive(playerPedEntity, PedComponents[compGroup], drawableId)) {
                return;
            }

            Object.entries(textures).forEach(([textureIdString, { label, locate }]) => {
                if (label.length === 0) {
                    return;
                }

                const textureId = Number(textureIdString);

                let offset = 0;
                if (typeof offsets[compIndex] === 'object') {
                    for (const [dlc, dlcCompOffset] of Object.entries(offsets[compIndex])) {
                        if (textures[0].label.startsWith(`CLO_${dlc}`)) {
                            offset = dlcCompOffset;
                            break;
                        }
                    }
                }

                if (Number(locate) === 0) {
                    return;
                }

                const locateLabel = GetTextLabelForLocate(Number(locate), label);

                let created = locateLabel in menus;
                if (!created) {
                    if (DoesTextLabelExist(locateLabel)) {
                        const labelText = GetLabelText(locateLabel);
                        menus[locateLabel] = {
                            menu: NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, labelText, '', true, true),
                            items: [] as typeof menus[typeof locateLabel]['items']
                        };
                        created = true;
                        NativeUI.setEventListener(menus[locateLabel].menu, 'OnItemSelect', (_, item, index) => {
                            console.log('OnItemSelect was called!!');
                            if (menus[locateLabel].items[index - 1]) {
                                menus[locateLabel].items[index - 1].onSelected();
                            }
                        });
                    }
                }

                if (created) {
                    if (DoesTextLabelExist(label)) {
                        const labelText = GetLabelText(label);
                        const item = NativeUI.CreateItem(`${label} (${locate}): ${labelText}`, '');
                        NativeUI.Menu.AddItem(menus[locateLabel].menu, item);
                        menus[locateLabel].items.push({
                            onSelected() {
                                console.log(`activated ${labelText}`);
                                console.log(`fixedDrawableId: ${drawableId}, originalDrawableId: ${_}`)
                                console.log(`setting ${PedComponents[compGroup]} to drawable ${drawableId} + ${offset}, texture ${textureId}`);
                                const componentSlot = PedComponents[compGroup];
                                const finalDrawableId = drawableId + offset;

                                const finalTextureId = textureId;
                                let valid = IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId);
                                if (!valid) {
                                    console.log(`${compGroup} is invalid!`);
                                }
                                let componentsTried = 0; // prevent infinite loop
                                const selectedCompHash = GetHashNameForComponent(PlayerPedId(), componentSlot, finalDrawableId, textureId);
                                const forcedComponents = GetNumForcedComponents(selectedCompHash);
                                for (let forcedCompIndex = 0; forcedCompIndex < forcedComponents && componentsTried <= 11; forcedCompIndex++) {
                                    const [forcedCompHash, enumValue, forcedCompSlot] = GetForcedComponent(selectedCompHash, forcedCompIndex);
                                    const forcedCompSlotName = PedComponents[forcedCompSlot];
                                    console.log(`forcing ${forcedCompSlotName}: ${enumValue} (${forcedCompHash.toString(16)})`);

                                    // Try find a matching hash for a drawable & texture ID combination in the clothing store, 
                                    // and use the drawable & texture ID to set the ped's component variation.

                                    let drawableId = enumValue;
                                    let textureId = GetPedTextureVariation(PlayerPedId(), forcedCompSlot);

                                    const clothes = store.character.gender === 'Male'
                                        ? clothingStore.mp_m_freemode_01
                                        : clothingStore.mp_f_freemode_01;
                                    const drawables = clothes[forcedCompSlotName as keyof typeof clothes];
                                    for (const drawableIdString in drawables) {
                                        const forcedTextureId = [0, textureId].reduce((ret, textureId) => {
                                            if (typeof ret === 'undefined') {
                                                const hash = GetHashNameForComponent(PlayerPedId(), forcedCompSlot, Number(drawableIdString), textureId);
                                                if (hash === forcedCompHash) {
                                                    return textureId;
                                                }
                                            }

                                            return undefined;
                                        }, undefined);

                                        if (typeof forcedTextureId === 'number') {
                                            drawableId = Number(drawableIdString);
                                            textureId = forcedTextureId;
                                            break;
                                        }
                                    }

                                    if (![PedComponents.armour].includes(forcedCompSlot)) {
                                        switch (forcedCompSlot) {
                                            case PedComponents.accessories:
                                                drawableId = Math.max(0, drawableId - 30);
                                                break;
                                        }
                                        SetPedComponentVariation(PlayerPedId(), forcedCompSlot, drawableId, textureId, 0);
                                        store.character.customOutfit[forcedCompSlot] = [drawableId, textureId];
                                    }
                                    valid = IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId);
                                    componentsTried++;
                                }

                                const variantComponents = GetShopPedApparelVariantComponentCount(selectedCompHash);
                                for (let variant = 0; variant < variantComponents; variant++) {
                                    const [variantCompHash, enumValue, variantCompSlot] = GetVariantComponent(selectedCompHash, variant);
                                    const variantCompSlotName = PedComponents[variantCompSlot];
                                    console.log(`found variant for ${variantCompSlotName}: ${enumValue} (${variantCompHash.toString(16)})`);

                                    // Try find a matching hash for a drawable & texture ID combination in the clothing store, 
                                    // and use the drawable & texture ID to set the ped's component variation.

                                    let drawableId = enumValue;
                                    let textureId = GetPedTextureVariation(PlayerPedId(), variantCompSlot);

                                    const clothes = store.character.gender === 'Male'
                                        ? clothingStore.mp_m_freemode_01
                                        : clothingStore.mp_f_freemode_01;
                                    const drawables = clothes[variantCompSlotName as keyof typeof clothes];
                                    for (const drawableIdString in drawables) {
                                        const variantTextureId = [0, textureId].reduce((ret, textureId) => {
                                            if (typeof ret === 'undefined') {
                                                const hash = GetHashNameForComponent(PlayerPedId(), variantCompSlot, Number(drawableIdString), textureId);
                                                if (hash === variantCompHash) {
                                                    return textureId;
                                                }
                                            }

                                            return ret;
                                        }, undefined);

                                        if (typeof variantTextureId === 'number') {
                                            if (drawableId !== Number(drawableIdString)) {
                                                textureId = variantTextureId;
                                            }
                                            drawableId = Number(drawableIdString);
                                            break;
                                        }
                                    }

                                    if (![PedComponents.armour].includes(variantCompSlot)) {
                                        // switch (variantCompSlot) {
                                        //     case PedComponents.accessories:
                                        //         drawableId = Math.max(0, drawableId - 30);
                                        //         break;
                                        // }
                                        console.log(`setting variant component ${variantCompSlotName} to [${drawableId}, ${textureId}]`);
                                        SetPedComponentVariation(PlayerPedId(), variantCompSlot, drawableId, textureId, 0);
                                        store.character.customOutfit[variantCompSlot] = [drawableId, textureId];
                                    }
                                    valid = IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId);
                                    componentsTried++;
                                }
                                // TODO: if it's still invalid, reset all other components to default, then apply the ones that are compatible.
                                // Avoid changing the forced component slots.

                                if (!valid) {
                                    const existingVariations: Record<Extract<PedComponents, number>, [drawable: number, texture: number]> = Object.keys(PedComponents)
                                        .reduce((obj, comp) => {
                                            if (typeof comp === 'number' && ![PedComponents.hair].includes(comp)) {
                                                const compId = Number(comp);

                                                obj[compId as PedComponents] = [GetPedDrawableVariation(PlayerPedId(), compId), GetPedTextureVariation(PlayerPedId(), compId)];
                                            }

                                            return obj;
                                        }, {} as Record<Extract<PedComponents, number>, [drawable: number, texture: number]>);

                                    SetPedDefaultComponentVariation(PlayerPedId());
                                    SetPedComponentVariation(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId, 0);
                                    store.character.customOutfit[componentSlot] = [finalDrawableId, finalTextureId];

                                    Object.entries(existingVariations).forEach(([comp, [drawable, texture]]) => {
                                        if (IsPedComponentVariationValid(PlayerPedId(), comp as unknown as number, drawable, texture)) {
                                            SetPedComponentVariation(PlayerPedId(), comp as unknown as number, drawable, texture, 0);
                                            store.character.customOutfit[comp] = [drawable, texture];
                                            console.log(`Reset ${PedComponents[comp]} to [${drawable}, ${texture}]`);
                                        } else {
                                            console.log(`Tried setting ${PedComponents[comp]} to [${drawable}, ${texture}] but this would've made the component variation invalid.`);
                                        }
                                    })
                                }

                                if (IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, textureId)) {
                                    store.character.customOutfit[componentSlot] = [finalDrawableId, textureId];

                                    SetPedComponentVariation(PlayerPedId(), componentSlot, finalDrawableId, textureId, 0);
                                }
                            }
                        });
                    }
                }
            });
        });

        return menus;
    }, {} as Record<`CSHOP_ITEM${number}`, { menu: Menu, items: Array<{ onSelected: () => void }> }>)

}