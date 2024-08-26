import { OldDLCHairMap } from "constants/hair";
import { CharacterStore } from "state/character-store";
import { clothingStore } from "state/clothing-store";
import { Menu, MenuPool, NativeUI } from "ui";
import { UIAppearanceMenuContext } from "ui/menus/appearance";
import { getVMenuCharacters } from "./import"
import { applyVMenuCharacter, IVMenuCharacter } from "./ped";


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
            updateMenuItemValues(characters[charName]);
        });
    }
}

function updateMenuItemValues(character: IVMenuCharacter) {
    updateAppearanceMenuItemValues(character);
}

function updateAppearanceMenuItemValues({ PedAppearance: appearance, IsMale: isMale }: IVMenuCharacter) {
    const { hairItem } = UIAppearanceMenuContext;
    // Get hairstyle names from the GXT files.
    const baseHaircutNames = Object.fromEntries((['f', 'm'] as const).map((gender) => {
        const pedName = `mp_${gender}_freemode_01` as const;
        return [gender, Object.entries(clothingStore[pedName].hair).reduce((hair, [hairIndex, hairNames], i) => {
            const label = `HAIR_GROUP_${gender.toUpperCase()}${i}`;

            let text: string;

            // There's like a random NVG headset in the middle of the hair styles that causes some of them to be offset by one...
            if (!(hairNames?.[0]?.length > 0) && Number(hairIndex) >= 16) {
                return hair;
            }
            if (DoesTextLabelExist(label)) {
                text = GetLabelText(label);
            } else if (hairNames?.[0] && hairNames[0] in OldDLCHairMap && DoesTextLabelExist(OldDLCHairMap[hairNames?.[0] as keyof typeof OldDLCHairMap])) {
                text = GetLabelText(OldDLCHairMap[hairNames?.[0] as keyof typeof OldDLCHairMap]);
            } else if (DoesTextLabelExist(hairNames?.[0])) {
                text = GetLabelText(hairNames[0])
            }

            if (text) {
                const existingTextIndex = hair.findIndex(([existingText]) => existingText === text);
                if (existingTextIndex === -1) {
                    hair.push([text, [i]]);
                } else {
                    hair[existingTextIndex][1].push(i);
                }
            }

            return hair;
        }, [])];
    }));
    const haircutNames = baseHaircutNames[isMale ? 'm' : 'f'];
    const hairIndex = haircutNames.findIndex(([_, indices]) => indices.includes(appearance.hairStyle));
    console.log(appearance.hairStyle, haircutNames[hairIndex]?.[0]);;
    hairItem && haircutNames[hairIndex] && NativeUI.MenuItem.Index(hairItem, haircutNames[hairIndex][1][0] + 1);
}