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

    // TODO: Hair highlights
    const { hairItem, hairColourPanel } = UIAppearanceMenuContext;
    hairItem && haircutNames[hairIndex] && NativeUI.MenuItem.Index(hairItem, haircutNames[hairIndex][1][0] + 1);
    hairColourPanel && NativeUI.MenuListItem.setPanelValue(hairColourPanel, appearance.hairColor + 1);

    const { eyebrowsItem, eyebrowsColourPanel, eyebrowsPercentagePanel } = UIAppearanceMenuContext;
    eyebrowsItem && NativeUI.MenuListItem.Index(eyebrowsItem, appearance.eyebrowsStyle + 1);
    eyebrowsColourPanel && NativeUI.MenuListItem.setPanelValue(eyebrowsColourPanel, appearance.eyebrowsColor + 1);
    eyebrowsPercentagePanel && NativeUI.MenuListItem.setPanelValue(eyebrowsPercentagePanel, appearance.eyebrowsOpacity);

    const { beardItem, beardColourPanel, beardPercentagePanel } = UIAppearanceMenuContext;
    beardItem && NativeUI.MenuListItem.Index(beardItem, appearance.beardStyle + 1);
    beardColourPanel && NativeUI.MenuListItem.setPanelValue(beardColourPanel, appearance.beardColor + 1);
    beardPercentagePanel && NativeUI.MenuListItem.setPanelValue(beardPercentagePanel, appearance.beardOpacity);

    const { blemishesItem, blemishesOpacityPanel } = UIAppearanceMenuContext;
    blemishesItem && NativeUI.MenuListItem.Index(blemishesItem, appearance.blemishesStyle + 1);
    blemishesOpacityPanel && NativeUI.MenuListItem.setPanelValue(blemishesOpacityPanel, appearance.blemishesOpacity);

    const { agingItem, agingOpacityPanel } = UIAppearanceMenuContext;
    agingItem && NativeUI.MenuListItem.Index(agingItem, appearance.ageingStyle + 1);
    agingOpacityPanel && NativeUI.MenuListItem.setPanelValue(agingOpacityPanel, appearance.ageingOpacity);

    const { complexionItem, complexionOpacityPanel } = UIAppearanceMenuContext;
    complexionItem && NativeUI.MenuListItem.Index(complexionItem, appearance.complexionStyle + 1);
    complexionOpacityPanel && NativeUI.MenuListItem.setPanelValue(complexionOpacityPanel, appearance.complexionOpacity);

    const { molesItem, molesOpacityPanel } = UIAppearanceMenuContext;
    molesItem && NativeUI.MenuListItem.Index(molesItem, appearance.molesFrecklesStyle + 1);
    molesOpacityPanel && NativeUI.MenuListItem.setPanelValue(molesOpacityPanel, appearance.molesFrecklesOpacity);

    const { sunDamageItem, sunDamageOpacityPanel } = UIAppearanceMenuContext;
    sunDamageItem && NativeUI.MenuListItem.Index(sunDamageItem, appearance.sunDamageStyle + 1);
    sunDamageOpacityPanel && NativeUI.MenuListItem.setPanelValue(sunDamageOpacityPanel, appearance.sunDamageOpacity);

    const { eyeColourItem } = UIAppearanceMenuContext;
    eyeColourItem && NativeUI.MenuListItem.Index(eyeColourItem, appearance.eyeColor + 1);

    const { makeupItem, makeupColourPanel, makeupOpacityPanel } = UIAppearanceMenuContext;
    makeupItem && NativeUI.MenuListItem.Index(makeupItem, appearance.makeupStyle + 2);
    makeupColourPanel && NativeUI.MenuListItem.setPanelValue(makeupColourPanel, appearance.makeupColor + 1);
    makeupOpacityPanel && NativeUI.MenuListItem.setPanelValue(makeupOpacityPanel, appearance.makeupOpacity);

    const { blushItem, blushColourPanel, blushOpacityPanel } = UIAppearanceMenuContext;
    blushItem && NativeUI.MenuListItem.Index(blushItem, appearance.blushStyle + 2);
    blushColourPanel && NativeUI.MenuListItem.setPanelValue(blushColourPanel, appearance.blushColor + 1);
    blushOpacityPanel && NativeUI.MenuListItem.setPanelValue(blushOpacityPanel, appearance.blushOpacity);

    const { lipstickItem, lipstickColourPanel, lipstickOpacityPanel } = UIAppearanceMenuContext;
    lipstickItem && NativeUI.MenuListItem.Index(lipstickItem, appearance.lipstickStyle + 2);
    lipstickColourPanel && NativeUI.MenuListItem.setPanelValue(lipstickColourPanel, appearance.lipstickColor + 1);
    lipstickOpacityPanel && NativeUI.MenuListItem.setPanelValue(lipstickOpacityPanel, appearance.lipstickOpacity);
}