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
            updateMenuItemValues(characters[charName]);
            applyVMenuCharacter(characters[charName], store);
        });
    }
}

function updateMenuItemValues(character: IVMenuCharacter) {
    updateAppearanceMenuItemValues(character);
}

function updateAppearanceMenuItemValues({ PedAppearance: appearance, IsMale: isMale }: IVMenuCharacter) {
    const { hairItem, eyebrowsItem, beardItem, blemishesItem, agingItem, complexionItem, molesItem, sunDamageItem, eyeColourItem, makeupItem, blushItem, lipstickItem } = UIAppearanceMenuContext;
    const { lipstickColourPanel, lipstickOpacityPanel } = UIAppearanceMenuContext;
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
    // hairItem && NativeUI.MenuListItem.setPanelValue(hairItem, 1, appearance.hairColor + 1);

    const { eyebrowsColor, eyebrowsOpacity, eyebrowsStyle } = appearance;
    console.log({ eyebrowsColor, eyebrowsOpacity, eyebrowsStyle });
    eyebrowsItem && NativeUI.MenuListItem.Index(eyebrowsItem, appearance.eyebrowsStyle + 1);
    // eyebrowsItem && NativeUI.MenuListItem.setPanelValue(eyebrowsItem, 2, appearance.eyebrowsColor + 1);
    // eyebrowsItem && NativeUI.MenuListItem.setPanelValue(eyebrowsItem, 1, appearance.eyebrowsOpacity);

    beardItem && NativeUI.MenuListItem.Index(beardItem, appearance.beardStyle + 1);
    // beardItem && NativeUI.MenuListItem.setPanelValue(beardItem, 2, appearance.beardColor + 1);
    // beardItem && NativeUI.MenuListItem.setPanelValue(beardItem, 1, appearance.beardOpacity);

    blemishesItem && NativeUI.MenuListItem.Index(blemishesItem, appearance.blemishesStyle + 1);
    // blemishesItem && NativeUI.MenuListItem.setPanelValue(blemishesItem, 1, appearance.blemishesOpacity);

    agingItem && NativeUI.MenuListItem.Index(agingItem, appearance.ageingStyle + 1);
    // agingItem && NativeUI.MenuListItem.setPanelValue(agingItem, 1, appearance.ageingOpacity);

    complexionItem && NativeUI.MenuListItem.Index(complexionItem, appearance.complexionStyle + 1);
    // complexionItem && NativeUI.MenuListItem.setPanelValue(complexionItem, 1, appearance.complexionOpacity);

    molesItem && NativeUI.MenuListItem.Index(molesItem, appearance.molesFrecklesStyle + 1);
    // molesItem && NativeUI.MenuListItem.setPanelValue(molesItem, 1, appearance.molesFrecklesOpacity);

    sunDamageItem && NativeUI.MenuListItem.Index(sunDamageItem, appearance.sunDamageStyle + 1);
    // sunDamageItem && NativeUI.MenuListItem.setPanelValue(sunDamageItem, 1, appearance.sunDamageOpacity);

    eyeColourItem && NativeUI.MenuListItem.Index(eyeColourItem, appearance.eyeColor + 1);

    makeupItem && NativeUI.MenuListItem.Index(makeupItem, appearance.makeupStyle + 1);
    // makeupItem && NativeUI.MenuListItem.setPanelValue(makeupItem, 2, appearance.makeupColor + 1);
    // makeupItem && NativeUI.MenuListItem.setPanelValue(makeupItem, 1, appearance.makeupOpacity);

    blushItem && NativeUI.MenuListItem.Index(blushItem, appearance.blushStyle + 1);
    // blushItem && NativeUI.MenuListItem.setPanelValue(blushItem, 2, appearance.blushColor + 1);
    // blushItem && NativeUI.MenuListItem.setPanelValue(blushItem, 1, appearance.blushOpacity);

    const { lipstickColor, lipstickOpacity, lipstickStyle } = appearance;
    console.log({ lipstickStyle, lipstickOpacity, lipstickColor })
    lipstickItem && NativeUI.MenuListItem.Index(lipstickItem, appearance.lipstickStyle + 2);
    // appearance.lipstickStyle && NativeUI.MenuListItem.setPanelEnabled(lipstickItem, 1, true);
    // appearance.lipstickStyle && NativeUI.MenuListItem.setPanelEnabled(lipstickItem, 2, true);
    lipstickColourPanel && NativeUI.MenuListItem.setPanelValue(lipstickColourPanel, appearance.lipstickColor + 1);
    lipstickOpacityPanel && NativeUI.MenuListItem.setPanelValue(lipstickOpacityPanel, appearance.lipstickOpacity);
}