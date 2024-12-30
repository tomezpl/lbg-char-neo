import { Character, SavedCharacterSlotPrefix } from 'constants/character';
import { SaveCharacterControlId } from 'constants/misc';
import { RefreshModel } from 'ped';
import { store } from 'state';
import { restoreSavedCharacters, SavedCharacter } from 'state/character-store';
import { Menu, MenuPool, NativeUI, resetMenus } from 'ui';

interface IUISavedCharactersMenuContext {
    menu: Menu | null;
    menuQuick: Menu | null;
    refresh: (menu: Menu) => void;
    tick: (menu: Menu) => void;
    blockInput: boolean;
}

export const UISavedCharactersMenuContext: IUISavedCharactersMenuContext = {
    menu: null,
    menuQuick: null,
    refresh(menu) {
        const maxCharacters = 20;

        NativeUI.Menu.Clear(menu);

        for (let i = 0; i < maxCharacters; i++) {
            const characterJson = GetResourceKvpString(`${SavedCharacterSlotPrefix}${i}`);
            if (characterJson) {
                const savedChar = JSON.parse(characterJson) as SavedCharacter;
                if (savedChar?.slotName && typeof savedChar.character === 'object') {
                    const charItem = NativeUI.CreateItem(savedChar.slotName, 'Load this character.');
                    NativeUI.Menu.AddItem(menu, charItem);

                    // Loads the character when selected.
                    NativeUI.setEventListener(charItem, 'Activated', () => {
                        store.actions.setSavedCharacter(i);
                        RefreshModel(true, savedChar.character);
                        updateMenuValues(savedChar.character);
                    });
                }
            } else {
                const emptyItem = NativeUI.CreateItem('Empty slot', 'No character in this slot.');
                NativeUI.Menu.AddItem(menu, emptyItem);
            }
        }
    },
    blockInput: true,
    tick(menu) {
        const { blockInput } = UISavedCharactersMenuContext;
        if (!blockInput && menu !== UISavedCharactersMenuContext.menuQuick) {
            if (IsDisabledControlJustReleased(2, SaveCharacterControlId) || IsControlJustReleased(2, SaveCharacterControlId)) {
                const index = NativeUI.Menu.CurrentSelection(menu);
                console.log(`Attempting to save to slot ${index}`);

                // TODO: ask for name then save
                function save(name: string) {
                    const savedChar: SavedCharacter = { slotName: name, character: store.character };
                    SetResourceKvp(`${SavedCharacterSlotPrefix}${index - 1}`, JSON.stringify(savedChar));
                    restoreSavedCharacters(store);
                    UISavedCharactersMenuContext.refresh(menu);
                }
                // TODO: backspace doesn't fucking work because NativeUI hijacks it so add custom names at a later point...
                /*UISavedCharactersMenuContext.blockInput = true;
                const textKey = 'lbg-char_save_char_prompt';
                AddTextEntry(textKey, 'Enter the character name.');
                DisplayOnscreenKeyboard(0, textKey, '', `Character ${index}`, '', '', '', 20);
                const kbTick = setTick(() => {
                    NativeUI.Menu.DisEnableControls(menu, false);
                    const kbStatus = UpdateOnscreenKeyboard();
                    if (kbStatus === 1) {
                        const result = GetOnscreenKeyboardResult();
                        if (result) {
                            save(result);
                        }
                    }
                    if (kbStatus !== 0) {
                        UISavedCharactersMenuContext.blockInput = false;
                        NativeUI.Menu.DisEnableControls(menu, true);
                        clearTick(kbTick);
                    }
                })*/
                save(`Character ${index}`);
            }
        }
    }
};

export function addSavedCharactersMenu(menuPool: MenuPool, parentMenu: Menu, menuIndex: Extract<keyof IUISavedCharactersMenuContext, 'menu' | 'menuQuick'>): Menu {
    const menu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Saved Characters', 'Apply one of your saved character appearance presets.', false, false);

    UISavedCharactersMenuContext[menuIndex] = menu;
    UISavedCharactersMenuContext.refresh(UISavedCharactersMenuContext[menuIndex]);

    if (menuIndex !== 'menuQuick') {
        NativeUI.Menu.AddInstructionButton(menu, GetControlInstructionalButton(2, SaveCharacterControlId, true), 'Save to slot');
    }

    return menu;
}

function updateMenuValues(character: Character) {
    resetMenus({ character });
}