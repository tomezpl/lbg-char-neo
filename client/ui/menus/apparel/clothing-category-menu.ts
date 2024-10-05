import { GetTextLabelForLocate, PedComponents } from "constants/clothing";
import type { PedClothing } from "state/clothing-store";
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
                                console.log(`setting ${PedComponents[compGroup]} to drawable ${drawableId} + ${offset}, texture ${textureId}`)
                                SetPedComponentVariation(PlayerPedId(), PedComponents[compGroup], drawableId + offset, textureId, 0);
                            }
                        });
                    }
                }
            });
        });

        return menus;
    }, {} as Record<`CSHOP_ITEM${number}`, { menu: Menu, items: Array<{ onSelected: () => void }> }>)

}