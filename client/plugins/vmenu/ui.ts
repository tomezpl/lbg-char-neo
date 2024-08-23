import { CharacterStore } from "state/character-store";
import { Menu, MenuPool, NativeUI } from "ui";
import { getVMenuCharacters } from "./import"
import { applyVMenuCharacter } from "./ped";


export function addvMenuCharacterList(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const characters = getVMenuCharacters();

    if (characters && Object.keys(characters).length > 0) {
        const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Import from vMenu", "Import multiplayer character data created using vMenu.", true, true);

        let characterItemIndices = new Array<string>();

        Object.entries(characters).forEach(([charName, charData]) => {
            const menuItem = NativeUI.CreateItem(charName, "Import this character");
            NativeUI.Menu.AddItem(submenu, menuItem);
            characterItemIndices.push(charName);
        });

        NativeUI.setEventListener(submenu, "OnItemSelect", (sender, item, index) => {
            const charName = characterItemIndices[index - 1];
            applyVMenuCharacter(characters[charName], store);
        });
    }
}