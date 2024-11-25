import { PedComponents } from 'constants/clothing';
import { RefreshModel } from 'ped';
import { CharacterStore } from 'state/character-store';
import { Menu, MenuPool, NativeUI } from 'ui';

export function addMenuUpperBody(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const menu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Upper Body', 'Adjust your upper body mesh manually to fix clipping issues.', true, false);

    for (let i = 0; i <= 15; i++) {
        const drawableItem = NativeUI.CreateItem(`Body ${i}`, 'Change upper body mesh.');
        NativeUI.Menu.AddItem(menu, drawableItem);

        NativeUI.setEventListener(drawableItem, 'Activated', () => {
            console.log(`chose body type ${i}`);
            store.actions.setCustomOutfit({ ...store.character.customOutfit, [PedComponents.upper]: [i, GetPedTextureVariation(PlayerPedId(), PedComponents.upper)] });
            RefreshModel(true, store.character);
        });
    }

    return menu;
}