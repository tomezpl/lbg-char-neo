import { Character, DefaultCharacter, SavedCharacterSlotPrefix } from 'constants/character';
import { SaveCharacterControlId } from 'constants/misc';
import { FemaleParentIds, MaleParentIds } from 'constants/parents';
import { RefreshModel } from 'ped';
import { store } from 'state';
import { CharacterStore, restoreSavedCharacters, SavedCharacter } from 'state/character-store';
import { Menu, MenuPool, NativeUI, resetMenus } from 'ui';
import { getZtOIndex } from 'utils/misc';
import { UIAppearanceMenuContext } from './appearance';
import { UIFaceShapeMenuContext } from './face-shape';
import { UIGenderMenuContext } from './gender';
import { UIHeritageMenuContext } from './heritage';

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
                        RefreshModel(true, store.character);
                        updateMenuValues(store.character);
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

export function addSavedCharactersMenu(menuPool: MenuPool, parentMenu: Menu, menuIndex: Extract<keyof IUISavedCharactersMenuContext, 'menu' | 'menuQuick'>) {
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
    return;

    // Face shape
    Object.keys(DefaultCharacter).forEach((key) => {
        if (`${key}_item` in UIFaceShapeMenuContext) {
            const uiItem = UIFaceShapeMenuContext[`${key}_item` as keyof typeof UIFaceShapeMenuContext];
            const value: number = character[key as keyof Character] as number;
            const index = (value + 1) * 10 + 1;
            console.log(`setting ${key} UI item to ${value} (index: ${index})`);
            uiItem && NativeUI.MenuListItem.Index(uiItem, index);
        }
    });

    // Gender
    const { genderItem } = UIGenderMenuContext;
    genderItem && NativeUI.MenuListItem.Index(genderItem, character.gender === 'Male' ? 1 : 2);

    // Heritage
    const { dadItem, mumItem, resemblanceItem, skinToneItem, heritageWindow } = UIHeritageMenuContext;
    mumItem && NativeUI.MenuListItem.Index(mumItem, character.mom + 1);
    dadItem && NativeUI.MenuListItem.Index(dadItem, character.dad + 1);
    resemblanceItem && NativeUI.MenuListItem.Index(resemblanceItem, getZtOIndex(character.resemblance) + 1)
    skinToneItem && NativeUI.MenuListItem.Index(skinToneItem, getZtOIndex(character.skintone) + 1);

    const dads = MaleParentIds;
    const mums = FemaleParentIds;
    const mom = character.mom;
    const dad = character.dad;
    heritageWindow && NativeUI.Window.Index(heritageWindow, (dads.find((d) => Number(d) === mom) ? `-${dads.findIndex((d) => Number(d) === mom)}` : mums.findIndex((m) => Number(m) === mom)) as number,
        (mums.find((m) => Number(m) === dad) ? `-${mums.findIndex((m) => Number(m) === dad)}` : dads.findIndex((d) => Number(d) === dad)) as number)

    // Appearance
    // TODO: Hair highlights
    const { hairItem, hairColourPanel } = UIAppearanceMenuContext;
    hairItem && NativeUI.MenuItem.Index(hairItem, character.hair + 1);
    hairColourPanel && NativeUI.MenuListItem.setPanelValue(hairColourPanel, character.hair_color_1 + 1);

    const { eyebrowsItem, eyebrowsColourPanel, eyebrowsPercentagePanel } = UIAppearanceMenuContext;
    eyebrowsItem && NativeUI.MenuListItem.Index(eyebrowsItem, character.eyebrows + 1);
    eyebrowsColourPanel && NativeUI.MenuListItem.setPanelValue(eyebrowsColourPanel, character.eyebrows_3 + 1);
    eyebrowsPercentagePanel && NativeUI.MenuListItem.setPanelValue(eyebrowsPercentagePanel, character.eyebrows_2);

    const { beardItem, beardColourPanel, beardPercentagePanel } = UIAppearanceMenuContext;
    beardItem && NativeUI.MenuListItem.Index(beardItem, character.beard + 1);
    beardColourPanel && NativeUI.MenuListItem.setPanelValue(beardColourPanel, character.beard_3 + 1);
    beardPercentagePanel && NativeUI.MenuListItem.setPanelValue(beardPercentagePanel, character.beard_2);

    const { blemishesItem, blemishesOpacityPanel } = UIAppearanceMenuContext;
    blemishesItem && NativeUI.MenuListItem.Index(blemishesItem, character.bodyb_1 + 1);
    blemishesOpacityPanel && NativeUI.MenuListItem.setPanelValue(blemishesOpacityPanel, character.bodyb_2);

    const { agingItem, agingOpacityPanel } = UIAppearanceMenuContext;
    agingItem && NativeUI.MenuListItem.Index(agingItem, character.age_1 + 1);
    agingOpacityPanel && NativeUI.MenuListItem.setPanelValue(agingOpacityPanel, character.age_2);

    const { complexionItem, complexionOpacityPanel } = UIAppearanceMenuContext;
    complexionItem && NativeUI.MenuListItem.Index(complexionItem, character.complexion_1 + 1);
    complexionOpacityPanel && NativeUI.MenuListItem.setPanelValue(complexionOpacityPanel, character.complexion_2);

    const { molesItem, molesOpacityPanel } = UIAppearanceMenuContext;
    molesItem && NativeUI.MenuListItem.Index(molesItem, character.moles_1 + 1);
    molesOpacityPanel && NativeUI.MenuListItem.setPanelValue(molesOpacityPanel, character.moles_2);

    const { sunDamageItem, sunDamageOpacityPanel } = UIAppearanceMenuContext;
    sunDamageItem && NativeUI.MenuListItem.Index(sunDamageItem, character.sun_1 + 1);
    sunDamageOpacityPanel && NativeUI.MenuListItem.setPanelValue(sunDamageOpacityPanel, character.sun_2);

    const { eyeColourItem } = UIAppearanceMenuContext;
    eyeColourItem && NativeUI.MenuListItem.Index(eyeColourItem, character.eye_color + 1);

    const { makeupItem, makeupColourPanel, makeupOpacityPanel } = UIAppearanceMenuContext;
    makeupItem && NativeUI.MenuListItem.Index(makeupItem, character.makeup_1 + 2);
    makeupColourPanel && NativeUI.MenuListItem.setPanelValue(makeupColourPanel, character.makeup_3);
    makeupOpacityPanel && NativeUI.MenuListItem.setPanelValue(makeupOpacityPanel, character.makeup_2);

    const { blushItem, blushColourPanel, blushOpacityPanel } = UIAppearanceMenuContext;
    blushItem && NativeUI.MenuListItem.Index(blushItem, character.blush_1 + 2);
    blushColourPanel && NativeUI.MenuListItem.setPanelValue(blushColourPanel, character.blush_3);
    blushOpacityPanel && NativeUI.MenuListItem.setPanelValue(blushOpacityPanel, character.blush_2);

    const { lipstickItem, lipstickColourPanel, lipstickOpacityPanel } = UIAppearanceMenuContext;
    lipstickItem && NativeUI.MenuListItem.Index(lipstickItem, character.lipstick_1 + 2);
    lipstickColourPanel && NativeUI.MenuListItem.setPanelValue(lipstickColourPanel, character.lipstick_3);
    lipstickOpacityPanel && NativeUI.MenuListItem.setPanelValue(lipstickOpacityPanel, character.lipstick_2);
}