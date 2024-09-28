import { ClothingItemCategories, ClothingItemLocateOffsets, getDLCItemOffset, GetTextLabelForLocate, KnownGen9ECLabels, LastPreGen9ECLabel, PedComponents } from "constants/clothing";
import { ChangeComponents } from "ped";
import { CharacterStore } from "state/character-store";
import { clothingStore } from "state/clothing-store";
import { Menu, MenuItem, MenuPool, NativeUI } from "ui";

export async function addMenuApparel(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Apparel", "Select to change your Apparel.", true, true);

    const { character } = store;

    const outfits = [
        "Racing Default",
        "Biker Apparel",
        "Freemode Classic",
        "Double Agent",
        "lambdaguy101"
    ] as const;

    const haveGlasses = ["No", "Yes"] as const;

    const femaleGlassesDrawables = [5, 11] as const;
    const maleGlassesDrawables = [11, 5] as const;

    const outfitItem = NativeUI.CreateListItem("Outfit", outfits, character.outfit, "Make changes to your Apparel.")
    NativeUI.Menu.AddItem(submenu, outfitItem);

    // const glassesItem = NativeUI.CreateListItem("Aviators", haveGlasses, character.glasses + 1, "Make changes to your Apparel.");
    // NativeUI.Menu.AddItem(submenu, glassesItem);

    RequestAdditionalText("CLO_MNU", 0);
    for (let i = 0; i < 5 && !HasAdditionalTextLoaded(0); i++) {
        await new Promise<void>((resolve, reject) => {
            setTimeout(resolve, 200);
        });
    }


    const clothingGroupMenus = Object.entries(ClothingItemCategories)
        .reduce((menus, [key, value]) => {
            if (Number.isNaN(Number(key))) {
                const textLabel = `CSHOP_ITEM${value as number}` as const;
                const labelText = DoesTextLabelExist(textLabel) ? GetLabelText(textLabel) : (value as string);
                console.log(`${textLabel}:${labelText}`);
                menus[textLabel] = NativeUI.MenuPool.AddSubMenu(menuPool, submenu, labelText, '', true, false);
            }

            return menus;
        },
            {} as Record<`CSHOP_ITEM${number}`, Menu>);


    NativeUI.setEventListener(submenu, "OnMenuChanged", (parent, menu) => {
        if (menu === parent || menu === submenu) {
            return;
        }

        NativeUI.Menu.Clear(menu);

        const [categoryLabel] = Object.entries(clothingGroupMenus).find(([label, _menu]) => _menu === menu) || [];

        const playerPedEntity = PlayerPedId();

        switch (Number(categoryLabel?.slice('CSHOP_ITEM'.length))) {
            case ClothingItemCategories.Tops:
                const startIgnore = 441;
                const endIgnore = 450;
                const pedComponents = clothingStore[`mp_${character.gender[0].toLowerCase()}_freemode_01` as keyof typeof clothingStore];
                const topsComponents: ReadonlyArray<keyof typeof pedComponents> = ['torso'/*, 'upper', 'armour'*/];
                let gen9 = 0;
                let skipped = 0;
                const topsMenus = topsComponents.reduce((menus, compGroup) => {
                    const comps = pedComponents[compGroup];

                    let earliestIgnoredDrawableIndex = -1;
                    let lastLabel = '';

                    Object.entries(comps).forEach(([drawableIdString, textures]) => {
                        const drawableId = Number(drawableIdString);

                        const drawableGen9 = Object.values(textures).every(({ label }) => KnownGen9ECLabels.find((l) => label.includes(l)))

                        /*if (earliestIgnoredDrawableIndex === -1) {
                            if (drawableGen9) {
                                earliestIgnoredDrawableIndex = drawableId;
                            } else if (comps[drawableId - 1]?.[0]?.label.startsWith(LastPreGen9ECLabel) && Object.keys(textures).length === 1 && textures[0].label === '' && textures[0].locate === '-99') {
                                for (let i = drawableId; i < Object.keys(comps).length; i++) {
                                    if (Object.values(comps[i]).some(({ label }) => KnownGen9ECLabels.some((l) => label.startsWith(l)))) {
                                        earliestIgnoredDrawableIndex = drawableId;
                                        break;
                                    }
                                    if (Object.values(comps[i]).some(({ label }) => label !== '')) {
                                        break;
                                    }
                                }
                            }

                            console.log(`earliestIgnoredDrawableIndex: ${earliestIgnoredDrawableIndex}`);
                        }*/

                        if (drawableId >= startIgnore && drawableId <= endIgnore) {
                            skipped++;
                            console.log(`skipping ${drawableId}, skipped ${skipped} so far`);
                        }


                        /*`
                        if (earliestIgnoredDrawableIndex !== -1 && drawableId >= earliestIgnoredDrawableIndex && (drawableGen9 || (Object.keys(textures).length === 1 && textures[0].label === '' && textures[0].locate === '-99'))) {
                            gen9++;
                            return;
                        }*/

                        // if (!IsPedComponentVariationValid(playerPedEntity, PedComponents[compGroup], drawableId, 0)) {
                        //     console.log(`skipping ${drawableId} (${textures?.[0]?.label}), skipped ${++skipped}`);
                        // }
                        if (IsPedComponentVariationGen9Exclusive(playerPedEntity, PedComponents[compGroup], drawableId - skipped)) {
                            gen9++;
                            return;
                        }

                        Object.entries(textures).forEach(([textureIdString, { label, locate }]) => {
                            if (label.length === 0) {
                                return;
                            }

                            const textureId = Number(textureIdString);


                            if (Number(locate) === 0) {
                                return;
                            }

                            const locateLabel = GetTextLabelForLocate(Number(locate), label);

                            let created = locateLabel in menus;
                            if (!created) {
                                if (DoesTextLabelExist(locateLabel)) {
                                    const labelText = GetLabelText(locateLabel);
                                    menus[locateLabel] = {
                                        menu: NativeUI.MenuPool.AddSubMenu(menuPool, menu, labelText, '', true, true),
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
                                    const offset = -(skipped);
                                    menus[locateLabel].items.push({
                                        onSelected() {
                                            console.log(`activated ${labelText}`);
                                            console.log(`setting ${PedComponents[compGroup]} to drawable ${drawableId} + (${offset}), texture ${textureId}`)
                                            SetPedComponentVariation(PlayerPedId(), PedComponents[compGroup], drawableId + (offset), textureId, 0);
                                        }
                                    });
                                }
                            }
                        });
                    });

                    return menus;
                }, {} as Record<`CSHOP_ITEM${number}`, { menu: Menu, items: Array<{ onSelected: () => void }> }>)
                break;
        }
    });

    NativeUI.setEventListener(submenu, "OnListChange", (sender, item, index) => {
        if (item === outfitItem) {
            store.actions.setOutfit(index - 1);
            ChangeComponents(false);
        }

        /*
        if (item === glassesItem) {
            store.actions.setGlasses(index - 1);

            SetPedPropIndex(PlayerPedId(), 1, (character.gender === "Male" ? maleGlassesDrawables : femaleGlassesDrawables)[index - 1], 0, true);
        }
        */
    });
}