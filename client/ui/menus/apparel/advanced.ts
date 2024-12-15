import { PedComponents, PedProps } from 'constants/clothing';
import { CharacterStore } from 'state/character-store';
import { Menu, MenuPool, NativeUI } from 'ui';
import { Logger } from 'utils/logger';

export function addAdvancedApparelMenu(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Advanced Apparel Options', 'Select to manually tweak character component slots.', true, true);

    const compNames = [
        ...[PedComponents, PedProps].flatMap((names) => Object.keys(names).filter((k) => Number.isNaN(Number(k)))),
    ];

    type CompName = Extract<keyof (typeof PedProps | typeof PedComponents), 'string'>;
    const menus = compNames.map((compName: CompName) => {
        const isProp = !!(compName as string)?.match(/^ph?_/);
        const nameText = `${isProp ? 'Prop' : 'Component'} #${isProp ? PedProps[compName] : PedComponents[compName]} (${compName as string})`;

        const compMenu = NativeUI.MenuPool.AddSubMenu(menuPool, submenu, nameText, '', true, true);

        return compMenu;
    });

    function createLists(menu: Menu, compName: CompName) {
        NativeUI.Menu.Clear(menu);

        const isProp = !!(compName as string)?.match(/^ph?_/);

        const compSlot = (isProp ? PedProps[compName] : PedComponents[compName]) as unknown as number;

        const numDrawables = isProp
            ? GetNumberOfPedPropDrawableVariations(PlayerPedId(), compSlot)
            : GetNumberOfPedDrawableVariations(PlayerPedId(), compSlot);

        function getTargetObject(isProp: boolean): Record<number, [drawable: number, texture: number]> {
            return (isProp ? store.character.customProps : store.character.customOutfit) as Record<number, [drawable: number, texture: number]>;
        }

        const drawableItem = NativeUI.CreateListItem(
            'Drawable',
            [...Array<string>(numDrawables)].map((_, i) => `${i}`),
            (((getTargetObject(isProp))[compSlot || -1])?.[0] || 0) + 1,
            '');
        NativeUI.Menu.AddItem(menu, drawableItem);

        const textureItem = NativeUI.CreateListItem(
            'Texture',
            [...Array<string>(100)].map((_, i) => `${i}`),
            (((getTargetObject(isProp))[compSlot || -1])?.[1] || 0) + 1,
            '');
        NativeUI.Menu.AddItem(menu, textureItem);
        Logger.log(`created list for ${compName as string}`);

        NativeUI.setEventListener(drawableItem, 'OnListChanged', (parent, item, index) => {
            const currentTextureIndex = NativeUI.MenuListItem.Index(textureItem);

            const numTextures = isProp
                ? GetNumberOfPedPropTextureVariations(PlayerPedId(), compSlot, index - 1)
                : GetNumberOfPedTextureVariations(PlayerPedId(), compSlot, index - 1);

            let clampedTextureIndex = currentTextureIndex;

            if (currentTextureIndex > numTextures) {
                clampedTextureIndex = numTextures;
                NativeUI.MenuListItem.Index(textureItem, clampedTextureIndex);
            }

            const drawableIndex = index - 1;

            getTargetObject(isProp)[compSlot] = [drawableIndex, clampedTextureIndex - 1];
            if (isProp) {
                SetPedPropIndex(PlayerPedId(), compSlot, drawableIndex, clampedTextureIndex - 1, true);
            } else {
                SetPedComponentVariation(PlayerPedId(), compSlot, drawableIndex, clampedTextureIndex - 1, 0);
            }
        });

        NativeUI.setEventListener(textureItem, 'OnListChanged', (parent, item, index) => {
            const drawableIndex = NativeUI.MenuListItem.Index(drawableItem) - 1;

            const numTextures = isProp
                ? GetNumberOfPedPropTextureVariations(PlayerPedId(), compSlot, drawableIndex)
                : GetNumberOfPedTextureVariations(PlayerPedId(), compSlot, drawableIndex);

            // Wrap index
            if (index > numTextures) {
                index = 1;
                NativeUI.MenuListItem.Index(textureItem, index);
            }

            getTargetObject(isProp)[compSlot] = [drawableIndex, index - 1];
            if (isProp) {
                SetPedPropIndex(PlayerPedId(), compSlot, drawableIndex, index - 1, true);
            } else {
                SetPedComponentVariation(PlayerPedId(), compSlot, drawableIndex, index - 1, 0);
            }
        });
    }

    NativeUI.setEventListener(submenu, 'OnMenuChanged', (parent, menu) => {
        const menuIndex = menus.indexOf(menu);
        if (menuIndex !== -1) {
            createLists(menu, compNames[menuIndex] as never);
        }
    });
}
