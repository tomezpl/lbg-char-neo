import { PedComponents, PedProps } from "constants/clothing";
import { CharacterStore } from "state/character-store";
import { Menu, MenuPool, NativeUI } from "ui";
import { Logger } from "utils/logger";

export function addAdvancedApparelMenu(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Advanced Apparel Options', 'Select to manually tweak character component slots.', true, true);

    const compNames = [
        ...[PedComponents, PedProps].flatMap((names) => Object.keys(names).filter((k) => Number.isNaN(Number(k)))),
    ];

    const menus = compNames.map((compName) => {
        const isProp = !!(compName as string)?.match(/^ph?_/);
        const nameText = `${isProp ? 'Prop' : 'Component'} #${isProp ? PedProps[compName] : PedComponents[compName]} (${compName})`;

        const compMenu = NativeUI.MenuPool.AddSubMenu(menuPool, submenu, nameText, '', true, true);

        return compMenu;
    });

    function createLists(menu: Menu, compName: string) {
        NativeUI.Menu.Clear(menu);

        const isProp = !!(compName as string)?.match(/^ph?_/);

        const compSlot = isProp ? PedProps[compName] : PedComponents[compName];

        const numDrawables = isProp
            ? GetNumberOfPedPropDrawableVariations(PlayerPedId(), compSlot)
            : GetNumberOfPedDrawableVariations(PlayerPedId(), compSlot);

        const drawableItem = NativeUI.CreateListItem(
            'Drawable',
            [...Array(numDrawables)].map((_, i) => `${i}`),
            (((isProp ? store.character.customProps : store.character.customOutfit)[compSlot || -1])?.[0] || 0) + 1,
            '');
        NativeUI.Menu.AddItem(menu, drawableItem);

        const textureItem = NativeUI.CreateListItem(
            'Texture',
            [...Array(100)].map((_, i) => `${i}`),
            (((isProp ? store.character.customProps : store.character.customOutfit)[compSlot || -1])?.[1] || 0) + 1,
            '');
        NativeUI.Menu.AddItem(menu, textureItem);
        Logger.log(`created list for ${compName}`);

        NativeUI.setEventListener(drawableItem, 'OnListChanged', (parent, item, index) => {
            const currentTextureIndex = NativeUI.MenuListItem.Index(textureItem);

            const numTextures = isProp
                ? GetNumberOfPedPropTextureVariations(PlayerPedId(), compSlot, index - 1)
                : GetNumberOfPedTextureVariations(PlayerPedId(), compSlot, index - 1);

            let clampedTextureIndex = currentTextureIndex;

            if (currentTextureIndex >= numTextures) {
                clampedTextureIndex = numTextures;
                NativeUI.MenuListItem.Index(textureItem, clampedTextureIndex);
            }

            const drawableIndex = index - 1;

            if (isProp) {
                store.character.customProps[compSlot] = [drawableIndex, clampedTextureIndex - 1];
                SetPedPropIndex(PlayerPedId(), compSlot, drawableIndex, clampedTextureIndex - 1, true);
            } else {
                store.character.customOutfit[compSlot] = [drawableIndex, clampedTextureIndex - 1];
                SetPedComponentVariation(PlayerPedId(), compSlot, drawableIndex, clampedTextureIndex - 1, 0);
            }
        });

        NativeUI.setEventListener(textureItem, 'OnListChanged', (parent, item, index) => {
            const drawableIndex = NativeUI.MenuListItem.Index(drawableItem) - 1;

            const numTextures = isProp
                ? GetNumberOfPedPropTextureVariations(PlayerPedId(), compSlot, drawableIndex)
                : GetNumberOfPedTextureVariations(PlayerPedId(), compSlot, drawableIndex);

            // Wrap index
            if (index >= numTextures) {
                index = 1;
                NativeUI.MenuListItem.Index(textureItem, index);
            }

            if (isProp) {
                store.character.customProps[compSlot] = [drawableIndex, index - 1];
                SetPedPropIndex(PlayerPedId(), compSlot, drawableIndex, index - 1, true);
            } else {
                store.character.customOutfit[compSlot] = [drawableIndex, index - 1];
                SetPedComponentVariation(PlayerPedId(), compSlot, drawableIndex, index - 1, 0);
            }
        });
    }

    NativeUI.setEventListener(submenu, 'OnMenuChanged', (parent, menu) => {
        const menuIndex = menus.indexOf(menu);
        if (menuIndex !== -1) {
            createLists(menu, compNames[menuIndex]);
        }
    });

    const { character } = store;
}
