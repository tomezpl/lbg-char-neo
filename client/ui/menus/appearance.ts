import { DefaultHairDecor, HairDecor, OldDLCHairMap } from "constants/hair";
import { clothingStore } from "state/clothing-store";
import { CharacterStore } from "state/character-store";
import { Menu, MenuItem, MenuPool, NativeUI, Panel, UIContext } from "ui";
import { ensureArray } from "utils/misc";
import { cameraShots } from "constants/camera";
import { createSkinCamera } from "anim";

let submenu: Menu;

interface IUIAppearanceMenuContext {
	hairItem: MenuItem;
	hairColourPanel: Panel;

	eyebrowsItem: MenuItem;
	eyebrowsColourPanel: Panel;
	eyebrowsPercentagePanel: Panel;

	beardItem: MenuItem;
	beardColourPanel: Panel;
	beardPercentagePanel: Panel;

	blemishesItem: MenuItem;
	blemishesOpacityPanel: Panel;

	agingItem: MenuItem;
	agingOpacityPanel: Panel;

	complexionItem: MenuItem;
	complexionOpacityPanel: Panel;

	sunDamageItem: MenuItem;
	sunDamageOpacityPanel: Panel;

	molesItem: MenuItem;
	molesOpacityPanel: Panel;

	eyeColourItem: MenuItem;

	makeupItem: MenuItem;
	makeupOpacityPanel: Panel;
	makeupColourPanel: Panel;

	blushItem: MenuItem;
	blushOpacityPanel: Panel;
	blushColourPanel: Panel;

	lipstickItem: MenuItem;
	lipstickOpacityPanel: Panel;
	lipstickColourPanel: Panel;
}

export const UIAppearanceMenuContext: Partial<IUIAppearanceMenuContext> = {};

/**
 * Helper function to check if an overlay should be set to "None". This returns true if all {@link overlayValues} are 0.
 * @param overlayValues Values used for this overlay (style, opacity, colour?)
 * @returns 
 */
function hasOverlay(overlayValues: [number, number] | [number, number, number]): boolean {
	return overlayValues.some((v) => v !== 0);
}

export function addMenuAppearance(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
	if (submenu) {
		NativeUI.Menu.Clear(submenu);
	} else {
		submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Appearance', 'Select to change your Appearance.', true, false);
	}

	// Get hairstyle names from the GXT files.
	const baseHaircutNames = Object.fromEntries((['f', 'm'] as const).map((gender) => {
		const pedName = `mp_${gender}_freemode_01` as const;
		return [gender, Object.entries(clothingStore[pedName].hair).reduce((hair, [hairIndex, hairNames], i) => {
			const label = `HAIR_GROUP_${gender.toUpperCase()}${i}`;

			let text: string;

			// There's like a random NVG headset in the middle of the hair styles that causes some of them to be offset by one...
			if (!(hairNames?.[0]?.label?.length > 0) && Number(hairIndex) >= 16) {
				return hair;
			}
			if (DoesTextLabelExist(label)) {
				text = GetLabelText(label);
			} else if (hairNames?.[0]?.label && hairNames[0]?.label in OldDLCHairMap && DoesTextLabelExist(OldDLCHairMap[hairNames?.[0]?.label as keyof typeof OldDLCHairMap])) {
				text = GetLabelText(OldDLCHairMap[hairNames?.[0]?.label as keyof typeof OldDLCHairMap]);
			} else if (DoesTextLabelExist(hairNames?.[0]?.label)) {
				text = GetLabelText(hairNames[0]?.label)
			}

			if (text && !hair.some(([existingText]) => existingText === text)) {
				hair.push([text, i]);
			}

			return hair;
		}, [] as [string, number][])];
	}));

	const haircutNames = baseHaircutNames;

	const { character, actions } = store;

	const hairItem = NativeUI.CreateListItem('Hair', haircutNames[character.ogd?.length > 0 ? character.ogd.toLowerCase() : 'm'].map(([name]) => name), character.hair + 1, 'Make changes to your Appearance.');
	const hairColours = [...Array(GetNumHairColors())].map((_, i) => [...GetHairRgbColor(i), 255] as [number, number, number, number]);
	const hairColour = NativeUI.CreateColourPanel('Color', hairColours);
	NativeUI.MenuListItem.AddPanel(hairItem, hairColour);
	NativeUI.Menu.AddItem(submenu, hairItem);

	UIAppearanceMenuContext.hairItem = hairItem;
	UIAppearanceMenuContext.hairColourPanel = hairColour;
	character.hair > 0 && NativeUI.MenuListItem.setPanelEnabled(hairItem, 1, true);
	character.hair > 0 && NativeUI.MenuListItem.setPanelValue(hairColour, character.hair_color_1);

	NativeUI.setEventListener(hairItem, 'OnListChanged', (sender, selectedItem, index) => {
		const activeItem = NativeUI.MenuListItem.IndexToItem(selectedItem, index);
		const colour = Number(NativeUI.MenuListItem.getPanelValue(hairColour) || 1);

		// Look up the actual hair component index in the array.
		index = haircutNames[character.ogd?.length > 0 ? character.ogd.toLowerCase() : 'm'][index - 1][1] + 1;

		actions.setHair_color_1(colour - 1)
		actions.setHair(index - 1);

		SetPedComponentVariation(PlayerPedId(), 2, index - 1, 0, 2);
		SetPedHairColor(PlayerPedId(), colour - 1, 0);

		ClearPedDecorations(PlayerPedId());

		const hairDecor = HairDecor[character.gender];
		AddPedDecorationFromHashes(PlayerPedId(), ...(hairDecor?.[character.hair] || DefaultHairDecor));
	});


	type PropsToUpdate<P extends keyof typeof character = keyof typeof character> = [P] | [P, P] | [P, P, P];

	// Helper function to create an overlay item in the menu instead of having to duplicate calls to CreateListItem, CreatePercentagePanel, CreateColourPanel etc.
	function createOverlayItem(items: ReadonlyArray<string>, title: string, overlayId: number, defaultValue: number, propsToUpdate: PropsToUpdate, indexOffset = 0, colourType: 1 | 2 = 1) {
		const overlayItem = NativeUI.CreateListItem(title, items, defaultValue, "Make changes to your Appearance.");
		NativeUI.Menu.AddItem(submenu, overlayItem);

		const panels: Array<Panel> = [];

		if (propsToUpdate.length > 1) {
			panels.push(NativeUI.CreatePercentagePanel("0%", "Opacity", "100%"));
			NativeUI.MenuListItem.AddPanel(overlayItem, panels[0]);
			NativeUI.MenuListItem.setPanelEnabled(overlayItem, 1, false);
		}

		if (propsToUpdate.length > 2) {
			const numColours = colourType === 2 ? GetNumMakeupColors() : GetNumHairColors();
			const getColourRgb = colourType == 2 ? (i: number) => GetMakeupRgbColor(i) : (i: number) => GetHairRgbColor(i);
			const overlayColours = [...Array(numColours)].map((_, i) => [...getColourRgb(i), 255] as [number, number, number, number]);
			panels.push(NativeUI.CreateColourPanel("Color", overlayColours));
			NativeUI.MenuListItem.AddPanel(overlayItem, panels[1]);
			NativeUI.MenuListItem.setPanelEnabled(overlayItem, 2, false);
		}

		NativeUI.setEventListener(overlayItem, 'OnListChanged', (parent, item, index) => {
			// the overlayId !== 2 check is to make sure we don't remove eyebrows (the player can control this with opacity)
			if (index <= 1 && overlayId !== 2) {
				for (let i = 0; i < Math.min(2, propsToUpdate.length - 1); i++) {
					NativeUI.MenuListItem.setPanelEnabled(overlayItem, i + 1, false);
				}

				SetPedHeadOverlay(PlayerPedId(), overlayId, 0, 0);
				SetPedHeadOverlayColor(PlayerPedId(), overlayId, colourType, 0, 0);

				propsToUpdate.forEach((prop) => {
					actions[`set${prop[0].toUpperCase()}${prop.slice(1)}` as keyof typeof actions](0 as never);
				});
			} else {
				for (let i = 0; i < Math.min(2, propsToUpdate.length - 1); i++) {
					NativeUI.MenuListItem.setPanelEnabled(overlayItem, i + 1, true);
				}

				const activeItem = NativeUI.MenuListItem.IndexToItem(overlayItem, index);
				propsToUpdate.forEach((prop, idx) => {
					let value: number;
					switch (idx) {
						// Item index
						case 0:
							value = (index - 1) + indexOffset;
							break;
						// Percentage
						case 1:
							value = Number(NativeUI.MenuListItem.getPanelValue(panels[0]) ?? 1);
							SetPedHeadOverlay(PlayerPedId(), overlayId, (index - 1) + indexOffset, value);
							break;
						// Colour
						case 2:
							value = Number(NativeUI.MenuListItem.getPanelValue(panels[1]) || 1) - 1;
							SetPedHeadOverlayColor(PlayerPedId(), overlayId, colourType, value, 0);
							break;
					}

					actions[`set${prop[0].toUpperCase()}${prop.slice(1)}` as keyof typeof actions](value as never);
				});
			}
		});

		return { overlayItem, panels };
	}

	const description = "Select to change your Appearance." as const;

	const eyebrows = [
		"Balanced",
		"Fashion",
		"Cleopatra",
		"Quizzical",
		"Femme",
		"Seductive",
		"Pinched",
		"Chola",
		"Triomphe",
		"Carefree",
		"Curvaceous",
		"Rodent",

		"Double Tram",
		"Thin",
		"Penciled",
		"Mother Plucker",
		"Straight and Narrow",
		"Natural",
		"Fuzzy",
		"Unkempt",
		"Caterpillar",
		"Regular",
		"Mediterranean",
		"Groomed",
		"Bushels",

		"Feathered",
		"Prickly",
		"Monobrow",
		"Winged",
		"Triple Tram",
		"Arched Tram",
		"Cutouts",
		"Fade Away",
		"Solo Tram"
	] as const;
	const { overlayItem: eyebrowsItem, panels: [eyebrowsPercentagePanel, eyebrowsColourPanel] } = createOverlayItem(eyebrows, "Eyebrows", 2, character.eyebrows + 1, ['eyebrows', 'eyebrows_2', 'eyebrows_3'], 0, 1);
	UIAppearanceMenuContext.eyebrowsItem = eyebrowsItem;
	UIAppearanceMenuContext.eyebrowsColourPanel = eyebrowsColourPanel;
	UIAppearanceMenuContext.eyebrowsPercentagePanel = eyebrowsPercentagePanel;
	NativeUI.MenuListItem.setPanelEnabled(eyebrowsItem, 1, true);
	NativeUI.MenuListItem.setPanelEnabled(eyebrowsItem, 2, true);
	NativeUI.MenuListItem.setPanelValue([eyebrowsPercentagePanel, eyebrowsColourPanel], [character.eyebrows_2, character.eyebrows_3]);

	const beard = [
		"Clean Shaven",
		"Light Stubble",
		"Balbo",
		"Circle Beard",
		"Goatee",
		"Chin",
		"Chin Fuzz",
		"Pencil Chin Strap",
		"Scruffy",
		"Musketeer",
		"Mustache",

		"Trimmed Beard",
		"Stubble",
		"Thin Circle Beard",
		"Horseshoe",
		"Pencil and Chops",
		"Chin Strap Beard",
		"Balbo and Sideburns",
		"Mutton Chops",
		"Scruffy Beard",
		"Curly",

		"Curly and Deep Stranger",
		"Handlebar",
		"Faustic",
		"Otto and Patch",
		"Otto and Full Stranger",
		"Light Franz",
		"The Hampstead",
		"The Ambrose",
		"Lincoln Curtain"
	] as const;
	const { overlayItem: beardItem, panels: [beardOpacityPanel, beardColourPanel] } = createOverlayItem(beard, "Facial Hair", 1, character.beard + 1, ['beard', 'beard_2', 'beard_3'], -1, 1);
	UIAppearanceMenuContext.beardItem = beardItem;
	UIAppearanceMenuContext.beardPercentagePanel = beardOpacityPanel;
	UIAppearanceMenuContext.beardColourPanel = beardColourPanel;
	NativeUI.MenuListItem.setPanelEnabled(beardItem, 2, character.beard > 0);
	NativeUI.MenuListItem.setPanelValue(beardColourPanel, character.beard_3);
	NativeUI.MenuListItem.setPanelEnabled(beardItem, 1, character.beard > 0);
	NativeUI.MenuListItem.setPanelValue(beardOpacityPanel, character.beard_2);

	const blemishes = [
		"None",
		"Measles",
		"Pimples",
		"Spots",
		"Break Out",
		"Blackheads",
		"Build Up",
		"Pustules",
		"Zits",
		"Full Acne",
		"Acne",
		"Cheek Rash",
		"Face Rash",
		"Picker",
		"Puberty",
		"Eyesore",
		"Chin Rash",
		"Two Face",
		"T Zone",
		"Greasy",
		"Marked",
		"Acne Scarring",
		"Full Acne Scarring",
		"Cold Sores",
		"Impetigo"
	] as const;
	const hasBlemishes = hasOverlay([character.bodyb_1, character.bodyb_2]);
	const defaultBlemishStyle = hasBlemishes ? character.bodyb_1 + 2 : 1;
	const { overlayItem: blemishesItem, panels: [blemishesOpacityPanel] } = createOverlayItem(blemishes, "Skin Blemishes", 11, defaultBlemishStyle, ['bodyb_1', 'bodyb_2']);
	UIAppearanceMenuContext.blemishesItem = blemishesItem;
	UIAppearanceMenuContext.blemishesOpacityPanel = blemishesOpacityPanel;
	hasBlemishes && NativeUI.MenuListItem.setPanelEnabled(blemishesItem, 1, true);
	hasBlemishes && NativeUI.MenuListItem.setPanelValue(blemishesOpacityPanel, character.bodyb_2);

	const aging = [
		"None",
		"Crow's Feet",
		"First Signs",
		"Middle Aged",
		"Worry Lines",
		"Depression",
		"Distinguished",
		"Aged",
		"Weathered",
		"Wrinkled",
		"Sagging",
		"Tough Life",

		"Vintage",
		"Retired",
		"Junkie",
		"Geriatric"
	] as const;
	const hasAging = hasOverlay([character.age_1, character.age_2]);
	const defaultAgingStyle = hasAging ? character.age_1 + 2 : 1;
	const { overlayItem: agingItem, panels: [agingOpacityPanel] } = createOverlayItem(aging, 'Skin Aging', 3, defaultAgingStyle, ['age_1', 'age_2'], -1);
	UIAppearanceMenuContext.agingItem = agingItem;
	UIAppearanceMenuContext.agingOpacityPanel = agingOpacityPanel;
	hasAging && NativeUI.MenuListItem.setPanelEnabled(agingItem, 1, true);
	hasAging && NativeUI.MenuListItem.setPanelValue(agingOpacityPanel, character.age_2);

	const complexion = [
		"None",
		"Rosy Cheeks",
		"Stubble Rash",
		"Hot Flush",
		"Sunburn",
		"Bruised",
		"Alchoholic",
		"Patchy",
		"Totem",
		"Blood Vessels",
		"Damaged",
		"Pale",
		"Ghostly"
	] as const;
	const hasComplexion = hasOverlay([character.complexion_1, character.complexion_2]);
	const defaultComplexionStyle = hasComplexion ? character.complexion_1 + 2 : 1;
	const { overlayItem: complexionItem, panels: [complexionOpacityPanel] } = createOverlayItem(complexion, "Skin Complexion", 6, defaultComplexionStyle, ['complexion_1', 'complexion_2'], -1);
	UIAppearanceMenuContext.complexionItem = complexionItem;
	UIAppearanceMenuContext.complexionOpacityPanel = complexionOpacityPanel;
	hasComplexion && NativeUI.MenuListItem.setPanelEnabled(complexionItem, 1, true);
	hasComplexion && NativeUI.MenuListItem.setPanelValue(complexionOpacityPanel, character.complexion_2);

	const molesFreckles = [
		"None",
		"Cherub",
		"All Over",
		"Irregular",
		"Dot Dash",
		"Over the Bridge",
		"Baby Doll",
		"Pixie",
		"Sun Kissed",
		"Beauty Marks",
		"Line Up",
		"Modelesque",
		"Occasional",
		"Speckled",
		"Rain Drops",
		"Double Dip",
		"One Sided",
		"Pairs",
		"Growth"
	] as const;
	const hasMoles = hasOverlay([character.moles_1, character.moles_2]);
	const defaultMoles = hasMoles ? character.moles_1 + 2 : 1;
	const { overlayItem: molesItem, panels: [molesOpacityPanel] } = createOverlayItem(molesFreckles, 'Moles & Freckles', 9, defaultMoles, ['moles_1', 'moles_2']);
	UIAppearanceMenuContext.molesItem = molesItem;
	UIAppearanceMenuContext.molesOpacityPanel = molesOpacityPanel;
	hasMoles && NativeUI.MenuListItem.setPanelEnabled(molesItem, 1, true);
	hasMoles && NativeUI.MenuListItem.setPanelValue(molesOpacityPanel, character.moles_2);

	const skinDamage = [
		"None",
		"Uneven",
		"Sandpaper",
		"Patchy",
		"Rough",
		"Leathery",
		"Textured",
		"Coarse",
		"Rugged",
		"Creased",
		"Cracked",
		"Gritty"
	] as const;
	const hasSkinDamage = hasOverlay([character.sun_1, character.sun_2]);
	const defaultSkinDamageStyle = hasSkinDamage ? character.sun_1 + 2 : 1;
	const { overlayItem: skinDamageItem, panels: [skinDamageOpacityPanel] } = createOverlayItem(skinDamage, 'Skin Damage', 7, defaultSkinDamageStyle, ['sun_1', 'sun_2'], -1);
	UIAppearanceMenuContext.sunDamageItem = skinDamageItem;
	UIAppearanceMenuContext.sunDamageOpacityPanel = skinDamageOpacityPanel;
	hasSkinDamage && NativeUI.MenuListItem.setPanelEnabled(skinDamageItem, 1, true);
	hasSkinDamage && NativeUI.MenuListItem.setPanelValue(skinDamageOpacityPanel, character.sun_2);

	const eyeColours = [
		"Green",
		"Emerald",
		"Light Blue",
		"Ocean Blue",
		"Light Brown",
		"Dark Brown",
		"Hazel",
		"Dark Gray",
		"Light Gray",
		"Pink",
		"Yellow",
		"Purple",
		"Blackout",

		"Shades of Gray",
		"Tequila Sunrise",
		"Atomic",
		"Warp",
		"ECola",
		"Space Ranger",
		"Ying Yang",
		"Bullseye",
		"Lizard",
		"Dragon",
		"Extra Terrestrial",
		"Goat",
		"Smiley",
		"Possessed",

		"Demon",
		"Infected",
		"Alien",
		"Undead",
		"Zombie"
	] as const;
	const eyeColourItem = NativeUI.CreateListItem('Eye Color', eyeColours, character.eye_color + 1, description);
	NativeUI.Menu.AddItem(submenu, eyeColourItem);
	NativeUI.setEventListener(eyeColourItem, 'OnListChanged', (parent, item, index) => {
		SetPedEyeColor(PlayerPedId(), index - 1);
		actions.setEye_color(index - 1);
	});
	UIAppearanceMenuContext.eyeColourItem = eyeColourItem;

	const makeup = [
		"None",
		"Smoky Black",
		"Bronze",
		"Soft Gray",
		"Retro Glam",
		"Natural Look",
		"Cat Eyes",
		"Chola",
		"Vamp",
		"Vinewood Glamour",
		"Bubblegum",
		"Aqua Dream",
		"Pin up",
		"Purple Passion",
		"Smoky Cat Eye",
		"Smoldering Ruby",
		"Pop Princess"
	] as const;
	const hasMakeup = hasOverlay([character.makeup_1, character.makeup_2, character.makeup_3]);
	const defaultMakeupStyle = hasMakeup ? character.makeup_1 + 2 : 1;
	const { overlayItem: makeupItem, panels: [makeupOpacityPanel, makeupColourPanel] } = createOverlayItem(makeup, 'Makeup', 4, defaultMakeupStyle, ['makeup_1', 'makeup_2', 'makeup_3'], -1, 2);
	UIAppearanceMenuContext.makeupItem = makeupItem;
	UIAppearanceMenuContext.makeupColourPanel = makeupColourPanel;
	UIAppearanceMenuContext.makeupOpacityPanel = makeupOpacityPanel;
	hasMakeup && NativeUI.MenuListItem.setPanelEnabled(makeupItem, 1, true);
	hasMakeup && NativeUI.MenuListItem.setPanelEnabled(makeupItem, 2, true);
	hasMakeup && NativeUI.MenuListItem.setPanelValue([makeupOpacityPanel, makeupColourPanel], [character.makeup_2, character.makeup_3]);

	const blush = [
		"None",
		"Full",
		"Angled",
		"Round",
		"Horizontal",
		"High",
		"Sweetheart",
		"Eighties"
	] as const;
	const hasBlush = hasOverlay([character.blush_1, character.blush_2, character.blush_3]);
	const defaultBlushStyle = hasBlush ? character.blush_1 + 2 : 1;
	const { overlayItem: blushItem, panels: [blushOpacityPanel, blushColourPanel] } = createOverlayItem(blush, 'Blush', 5, defaultBlushStyle, ['blush_1', 'blush_2', 'blush_3'], -1, 2);
	UIAppearanceMenuContext.blushItem = blushItem;
	UIAppearanceMenuContext.blushColourPanel = blushColourPanel;
	UIAppearanceMenuContext.blushOpacityPanel = blushOpacityPanel;
	hasBlush && NativeUI.MenuListItem.setPanelEnabled(blushItem, 1, true);
	hasBlush && NativeUI.MenuListItem.setPanelEnabled(blushItem, 2, true);
	hasBlush && NativeUI.MenuListItem.setPanelValue([blushOpacityPanel, blushColourPanel], [character.blush_2, character.blush_3]);

	const lipstick = [
		"None",
		"Color Matte",
		"Color Gloss",
		"Lined Matte",
		"Lined Gloss",
		"Heavy Lined Matte",
		"Heavy Lined Gloss",
		"Lined Nude Matte",
		"Liner Nude Gloss",
		"Smudged",
		"Geisha"
	] as const;
	const hasLipstick = hasOverlay([character.lipstick_1, character.lipstick_2, character.lipstick_3]);
	const defaultLipstickStyle = hasLipstick ? character.lipstick_1 + 2 : 1;
	const { overlayItem: lipstickItem, panels: [lipstickOpacityPanel, lipstickColourPanel] } = createOverlayItem(lipstick, 'Lipstick', 8, defaultLipstickStyle, ['lipstick_1', 'lipstick_2', 'lipstick_3'], -1, 2);
	UIAppearanceMenuContext.lipstickItem = lipstickItem;
	UIAppearanceMenuContext.lipstickColourPanel = lipstickColourPanel;
	UIAppearanceMenuContext.lipstickOpacityPanel = lipstickOpacityPanel;
	hasLipstick && NativeUI.MenuListItem.setPanelEnabled(lipstickItem, 1, true);
	hasLipstick && NativeUI.MenuListItem.setPanelEnabled(lipstickItem, 2, true);
	hasLipstick && NativeUI.MenuListItem.setPanelValue([lipstickOpacityPanel, lipstickColourPanel], [character.lipstick_2, character.lipstick_3]);

	NativeUI.setEventListener(parentMenu, 'OnMenuChanged', (parent, menu) => {
		if (menu === submenu) {
			createSkinCamera(cameraShots.face)
		}

		if (character.gender === 'Male') {
			NativeUI.MenuListItem.setProp(hairItem, 'Items', baseHaircutNames['m'].map(([name]) => name));
		} else if (character.gender === 'Female') {
			NativeUI.MenuListItem.setProp(hairItem, 'Items', baseHaircutNames['f'].map(([name]) => name));
		}
	})

	NativeUI.setEventListener(submenu, 'OnMenuClosed', () => {
		createSkinCamera(cameraShots.body);
	});

	/*

	submenu.OnMenuClosed = function()
		CreateSkinCam('body')
	end*/
}