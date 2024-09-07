import { DefaultHairDecor, HairBrowColours, HairDecor, OldDLCHairMap } from "constants/hair";
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

			if (text && !hair.some(([existingText]) => existingText === text)) {
				hair.push([text, i]);
			}

			return hair;
		}, [])];
	}));

	const haircutNames = baseHaircutNames;

	const { character, actions } = store;

	const hairItem = NativeUI.CreateListItem('Hair', haircutNames[character.ogd?.length > 0 ? character.ogd.toLowerCase() : 'm'].map(([name]) => name), character.hair + 1, 'Make changes to your Appearance.');
	const hairColours = [...Array(GetNumHairColors())].map((_, i) => [...GetHairRgbColor(i), 255] as [number, number, number, number]);
	const hairColour = NativeUI.CreateColourPanel('Color', hairColours);
	NativeUI.MenuListItem.AddPanel(hairItem, hairColour);
	NativeUI.Menu.AddItem(submenu, hairItem);

	UIAppearanceMenuContext.hairItem = hairItem;

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

		const hairDecor = HairDecor[character.ogd as keyof typeof HairDecor];
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
						// Percentage
						case 1:
							value = Number(NativeUI.MenuListItem.getPanelValue(panels[0]) ?? 1);
							SetPedHeadOverlay(PlayerPedId(), overlayId, (index - 1) + indexOffset, value);
						// Colour
						case 2:
							value = Number(NativeUI.MenuListItem.getPanelValue(panels[1]) || 1) - 1;
							SetPedHeadOverlayColor(PlayerPedId(), overlayId, colourType, value, 0);
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
	const { overlayItem: blemishesItem, panels: [blemishesOpacityPanel] } = createOverlayItem(blemishes, "Skin Blemishes", 11, character.bodyb_1 + 1, ['bodyb_1', 'bodyb_2']);
	UIAppearanceMenuContext.blemishesItem = blemishesItem;
	UIAppearanceMenuContext.blemishesOpacityPanel = blemishesOpacityPanel;

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
	const { overlayItem: agingItem, panels: [agingOpacityPanel] } = createOverlayItem(aging, 'Skin Aging', 3, character.age_1 + 1, ['age_1', 'age_2'], -1);
	UIAppearanceMenuContext.agingItem = agingItem;
	UIAppearanceMenuContext.agingOpacityPanel = agingOpacityPanel;

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
	const { overlayItem: complexionItem, panels: [complexionOpacityPanel] } = createOverlayItem(complexion, "Skin Complexion", 6, character.complexion_1 + 1, ['complexion_1', 'complexion_2'], -1);
	UIAppearanceMenuContext.complexionItem = complexionItem;
	UIAppearanceMenuContext.complexionOpacityPanel = complexionOpacityPanel;

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
	const { overlayItem: molesItem, panels: [molesOpacityPanel] } = createOverlayItem(molesFreckles, 'Moles & Freckles', 9, character.moles_1, ['moles_1', 'moles_2']);
	UIAppearanceMenuContext.molesItem = molesItem;
	UIAppearanceMenuContext.molesOpacityPanel = molesOpacityPanel;

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
	const { overlayItem: skinDamageItem, panels: [skinDamageOpacityPanel] } = createOverlayItem(skinDamage, 'Skin Damage', 7, character.sun_1 + 1, ['sun_1', 'sun_2'], -1);
	UIAppearanceMenuContext.sunDamageItem = skinDamageItem;
	UIAppearanceMenuContext.sunDamageOpacityPanel = skinDamageOpacityPanel;

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
	const { overlayItem: makeupItem, panels: [makeupOpacityPanel, makeupColourPanel] } = createOverlayItem(makeup, 'Makeup', 4, character.makeup_1 + 1, ['makeup_1', 'makeup_2', 'makeup_3'], -1, 2);
	UIAppearanceMenuContext.makeupItem = makeupItem;
	UIAppearanceMenuContext.makeupColourPanel = makeupColourPanel;
	UIAppearanceMenuContext.makeupOpacityPanel = makeupOpacityPanel;

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
	const { overlayItem: blushItem, panels: [blushOpacityPanel, blushColourPanel] } = createOverlayItem(blush, 'Blush', 5, character.blush_1 + 1, ['blush_1', 'blush_2', 'blush_3'], -1, 2);
	UIAppearanceMenuContext.blushItem = blushItem;
	UIAppearanceMenuContext.blushColourPanel = blushColourPanel;
	UIAppearanceMenuContext.blushOpacityPanel = blushOpacityPanel;

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
	const { overlayItem: lipstickItem, panels: [lipstickOpacityPanel, lipstickColourPanel] } = createOverlayItem(lipstick, 'Lipstick', 8, character.lipstick_1 + 1, ['lipstick_1', 'lipstick_2', 'lipstick_3'], -1, 2);
	UIAppearanceMenuContext.lipstickItem = lipstickItem;
	UIAppearanceMenuContext.lipstickColourPanel = lipstickColourPanel;
	UIAppearanceMenuContext.lipstickOpacityPanel = lipstickOpacityPanel;

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