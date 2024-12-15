
import { Character } from 'constants/character';
import { CharacterStore } from 'state/character-store';
import { Menu, MenuPool, NativeUI, resetMenus } from 'ui';
import { getVMenuCharacters } from './import'
import { applyVMenuCharacter, IVMenuCharacter } from './ped';


/**
 * Adds an "Import from vMenu" submenu to {@link parentMenu}
 * @param menuPool 
 * @param parentMenu 
 * @param store 
 */
export function addvMenuCharacterList(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const characters = getVMenuCharacters();

    if (characters && Object.keys(characters).length > 0) {
        const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Import from vMenu', 'Import multiplayer character data created using vMenu.', true, true);

        const characterItemIndices = new Array<string>();

        Object.entries(characters).forEach(([charName]) => {
            const menuItem = NativeUI.CreateItem(charName, 'Import this character');
            NativeUI.Menu.AddItem(submenu, menuItem);
            characterItemIndices.push(charName);
        });

        NativeUI.setEventListener(submenu, 'OnItemSelect', (sender, item, index) => {
            const charName = characterItemIndices[index - 1];
            applyVMenuCharacter(characters[charName], store);
            console.log('logging updated character');
            console.log(JSON.stringify(store.character));
            updateMenuItemValues(characters[charName], store.character);
        });
    }
}

/**
 * Updates the UI state to display the new values.
 * @param vMenuCharacter 
 * @param character 
 */
function updateMenuItemValues(vMenuCharacter: IVMenuCharacter, character: Character) {
    resetMenus({ character });
}