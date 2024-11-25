import { GetTextLabelForLocate, PedComponents } from 'constants/clothing';
import { ForceApplyControlId } from 'constants/misc';
import { store } from 'state';
import { clothingStore, PedClothing } from 'state/clothing-store';
import { Menu, MenuPool, NativeUI } from 'ui';
import { iterateDrawables } from './stupid-drawable-index-fix';
import { Outfit } from 'constants/outfit';
import { Logger } from 'utils/logger';

/**
 * Creates a submenu of clothing categories for a top-level category.
 * 
 * E.g. for "Tops" this submenu will contain "T-Shirts", "Hoodies", "Jackets" submenus etc.
 * Since a top-level category may affect more than one component slot, these need to be defined in {@link componentsToInclude}
 */
export function createClothingCategorySubmenu(menuPool: MenuPool, parentMenu: Menu, pedComponents: PedClothing, componentsToInclude: ReadonlyArray<keyof PedClothing>, offsets: ReadonlyArray<Record<string, number>> = []) {
    const playerPedEntity = PlayerPedId();

    // Needed for the force apply button.
    let inputTick: number | undefined;

    // This will iterate over all drawables from componentsToInclude,
    // and then create UI items for them automatically placed in the appropriate subcategories.
    const itemCategoryMenus = componentsToInclude.reduce((menus, compGroup, compIndex) => {
        const comps = pedComponents[compGroup];

        // Iterate over all drawables for the current component.
        iterateDrawables(comps, (drawableId, _, textures) => {
            if (IsPedComponentVariationGen9Exclusive(playerPedEntity, PedComponents[compGroup], drawableId)) {
                return;
            }

            Object.entries(textures).forEach(([textureIdString, { label, locate }]) => {
                // Ignore empty labels, don't want them anyway
                if (label.length === 0) {
                    return;
                }

                // Get the texture ID integer from the key (should also be an integer but stored as a string)
                const textureId = Number(textureIdString);

                // Apply any offset the caller may have set for specific DLC names.
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

                // Try get the correct subcategory name for this clothing item.
                const locateLabel = GetTextLabelForLocate(Number(locate), label);

                let created = locateLabel in menus;
                // If the submenu for a given subcategory doesn't exist yet then create it now
                if (!created) {
                    if (DoesTextLabelExist(locateLabel)) {
                        const labelText = GetLabelText(locateLabel);

                        menus[locateLabel] = {
                            menu: NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, labelText, '', true, true),
                            items: [] as typeof menus[typeof locateLabel]['items']
                        };

                        // Add a "Force Apply" button in the bottom-right when this submenu is open.
                        NativeUI.Menu.AddInstructionButton(menus[locateLabel].menu, GetControlInstructionalButton(2, ForceApplyControlId, true), 'Force Apply');

                        created = true;

                        NativeUI.setEventListener(menus[locateLabel].menu, 'OnItemSelect', (_, item, index) => {
                            if (menus[locateLabel].items[index - 1]) {
                                menus[locateLabel].items[index - 1].onSelected();
                            }
                        });

                        // Remove the input tick if necessary so we don't accidentally Force Apply after closing the menu.
                        NativeUI.setEventListener(menus[locateLabel].menu, 'OnMenuClosed', () => {
                            if (typeof inputTick === 'number') {
                                clearTick(inputTick);
                                inputTick = undefined;
                            }
                        });
                    }
                }

                // Add the clothing item to the submenu
                if (created) {
                    if (DoesTextLabelExist(label)) {
                        const labelText = GetLabelText(label);
                        const item = NativeUI.CreateItem(`${label} (${locate}): ${labelText}`, '');
                        NativeUI.Menu.AddItem(menus[locateLabel].menu, item);
                        menus[locateLabel].items.push({
                            onSelected(force = false) {
                                Logger.log(`selected '${labelText}', drawable ID ${_} (${drawableId} with offset applied), texture ${textureId}, component ${PedComponents[compGroup]}`)
                                const componentSlot = PedComponents[compGroup] as Extract<PedComponents, number>;

                                const finalDrawableId = drawableId + offset;

                                const finalTextureId = textureId;
                                if (!force) {
                                    let valid = IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId);
                                    if (!valid) {
                                        Logger.warn(`${compGroup} is invalid!`);
                                    }
                                    let componentsTried = 0; // prevent infinite loop
                                    const selectedCompHash = GetHashNameForComponent(PlayerPedId(), componentSlot, finalDrawableId, textureId);
                                    const forcedComponents = GetNumForcedComponents(selectedCompHash);
                                    for (let forcedCompIndex = 0; forcedCompIndex < forcedComponents && componentsTried <= 11; forcedCompIndex++) {
                                        const [forcedCompHash, enumValue, forcedCompSlot] = GetForcedComponent(selectedCompHash, forcedCompIndex);
                                        const forcedCompSlotName = PedComponents[forcedCompSlot];
                                        Logger.log(`forcing ${forcedCompSlotName}: ${enumValue} (${forcedCompHash.toString(16)})`);

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

                                        // For whatever reason some clothes like shirts force an armour vest which makes no sense
                                        if (![PedComponents.armour].includes(forcedCompSlot)) {
                                            switch (forcedCompSlot as PedComponents) {
                                                case PedComponents.accessories:
                                                    drawableId = Math.max(0, drawableId - 30);
                                                    break;
                                            }
                                            SetPedComponentVariation(PlayerPedId(), forcedCompSlot, drawableId, textureId, 0);
                                            (store.character.customOutfit as Outfit)[forcedCompSlot as Extract<PedComponents, number>] = [drawableId, textureId];
                                        }
                                        valid = IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId);
                                        componentsTried++;
                                    }

                                    const variantComponents = GetShopPedApparelVariantComponentCount(selectedCompHash);
                                    for (let variant = 0; variant < variantComponents; variant++) {
                                        const [variantCompHash, enumValue, variantCompSlot] = GetVariantComponent(selectedCompHash, variant);
                                        const variantCompSlotName = PedComponents[variantCompSlot];
                                        Logger.log(`found variant for ${variantCompSlotName}: ${enumValue} (${variantCompHash.toString(16)})`);

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
                                            Logger.log(`setting variant component ${variantCompSlotName} to [${drawableId}, ${textureId}]`);
                                            SetPedComponentVariation(PlayerPedId(), variantCompSlot, drawableId, textureId, 0);
                                            (store.character.customOutfit as Outfit)[variantCompSlot as Extract<PedComponents, number>] = [drawableId, textureId];
                                        }
                                        valid = IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, finalTextureId);
                                        componentsTried++;
                                    }
                                    // if it's still invalid, reset all other components to default, then apply the ones that are compatible.
                                    // Avoid changing the forced component slots.

                                    /*if (!valid) {
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
                                        (store.character.customOutfit as Outfit)[componentSlot] = [finalDrawableId, finalTextureId];

                                        Object.entries(existingVariations).forEach(([comp, [drawable, texture]]) => {
                                            type ComponentIdInteger = Extract<typeof comp, number>;

                                            if (IsPedComponentVariationValid(PlayerPedId(), comp as ComponentIdInteger, drawable, texture)) {
                                                SetPedComponentVariation(PlayerPedId(), comp as ComponentIdInteger, drawable, texture, 0);
                                                (store.character.customOutfit as Outfit)[comp as unknown as PedComponents] = [drawable, texture];
                                                Logger.warn(`Reset ${PedComponents[comp as ComponentIdInteger]} to [${drawable}, ${texture}]`);
                                            } else {
                                                Logger.warn(`Tried setting ${PedComponents[comp as ComponentIdInteger]} to [${drawable}, ${texture}] but this would've made the component variation invalid.`);
                                            }
                                        })
                                    }*/
                                }

                                if (force || IsPedComponentVariationValid(PlayerPedId(), componentSlot, finalDrawableId, textureId)) {
                                    (store.character.customOutfit as Outfit)[componentSlot] = [finalDrawableId, textureId];

                                    SetPedComponentVariation(PlayerPedId(), componentSlot, finalDrawableId, textureId, 0);
                                }
                            }
                        });
                    }
                }
            });
        });

        return menus;
    }, {} as Record<`CSHOP_ITEM${number}`, { menu: Menu, items: Array<{ onSelected: (force?: boolean) => void }> }>)


    NativeUI.setEventListener(parentMenu, 'OnMenuChanged', (parent, menu) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const validMenu = Object.entries(itemCategoryMenus).find(([_, { menu: _menu }]) => _menu === menu);
        if (validMenu) {
            if (inputTick === undefined) {
                // Create a tick function to listen to the F (keyboard) or Y (controller) control being pressed,
                // and call onSelected on the currently highlighted item with the "force" flag if pressed.
                inputTick = setTick(() => {
                    if (IsDisabledControlJustReleased(2, ForceApplyControlId) || IsControlJustReleased(2, ForceApplyControlId)) {
                        const index = NativeUI.Menu.CurrentSelection(menu);
                        itemCategoryMenus[validMenu[0] as keyof typeof itemCategoryMenus].items[index - 1].onSelected(true);
                    }
                });
            }
        }
    });
}