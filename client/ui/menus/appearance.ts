import { DefaultHairDecor, HairBrowColours, HairDecor } from "constants/hair";
import { CharacterStore } from "state/character-store";
import { Menu, MenuPool, NativeUI } from "ui";
import { ensureArray } from "utils/misc";

export function addMenuAppearance(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
	const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Appearance', 'Select to change your Appearance.', true, false);

	const haircutNames = {
		male: [
			"Close Shave",
			"Buzzcut",
			"Faux Hawk",
			"Hipster",
			"Side Parting",
			"Shorter Cut",
			"Biker",
			"Ponytail",
			"Cornrows",
			"Slicked",
			"Short Brushed",
			"Spikey",
			"Caesar",
			"Chopped",
			"Dreads",
			"Long Hair",
			"Shaggy Curls",
			"Surfer Dude",
			"Short Side Part",
			"High Slicked Sides",
			"Long Slicked",
			"Hipster Youth",
			"Mullet"],
		female: [
			"Close Shave",
			"Short",
			"Layered Bob",
			"Pigtails",
			"Ponytail",
			"Braided Mohawk",
			"Braids",
			"Bob",
			"Faux Hawk",
			"French Twist",
			"Long Bob",
			"Loose Tied",
			"Pixie",
			"Shaved Bangs",
			"Top Knot",
			"Wavy Bob",
			"Pin Up Girl",
			"Messy Bun",
			"Unknown",
			"Tight Bun",
			"Twisted Bob",
			"Big Bangs",
			"Braided Top Knot"
		]
	} as const;

	const { character, actions } = store;

	const hairIndices = [...Array(Math.min(...Object.values(haircutNames).map(({ length: n }) => n)))].map((_, i) => `${i + 1}`);
	const hairItem = NativeUI.CreateListItem('Hair', hairIndices, character.hair + 1, 'Make changes to your Appearance.');
	const hairColour = NativeUI.CreateColourPanel('Color', HairBrowColours);
	NativeUI.MenuListItem.AddPanel(hairItem, hairColour);
	NativeUI.Menu.AddItem(submenu, hairItem);

	NativeUI.setEventListener(hairItem, 'OnListChanged', (sender, selectedItem, index) => {
		const activeItem = NativeUI.MenuListItem.IndexToItem(selectedItem, index);
		const colour = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 1) || 1);

		actions.setHair_color_1(colour - 1)
		actions.setHair(index - 1);

		SetPedComponentVariation(PlayerPedId(), 2, index - 1, 0, 2);
		SetPedHairColor(PlayerPedId(), colour - 1, 0);

		ClearPedDecorations(PlayerPedId());

		const hairDecor = HairDecor[character.ogd as keyof typeof HairDecor];
		AddPedDecorationFromHashes(PlayerPedId(), ...(hairDecor?.[character.hair] || DefaultHairDecor));
	});

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

	// const eyebrowItem = NativeUI.CreateListItem("Eyebrows", eyebrows, character.eyebrows + 1, "Select to change your Appearance.");
	// const browColour = NativeUI.CreateColourPanel("Color", HairBrowColours);
	// const browPercentageItem = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%");
	// NativeUI.MenuListItem.AddPanel(eyebrowItem, browPercentageItem);
	// NativeUI.MenuListItem.AddPanel(eyebrowItem, browColour)
	// NativeUI.Menu.AddItem(submenu, eyebrowItem);

	// NativeUI.setEventListener(eyebrowItem, 'OnListChanged', (parent, item, index) => {
	// 	NativeUI.MenuListItem.Index(eyebrowItem, index);
	// 	const activeItem = NativeUI.MenuListItem.IndexToItem(item, index);
	// 	const percentage = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 1) || 1);
	// 	const colour = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 2) || 1);

	// 	SetPedHeadOverlay(PlayerPedId(), 2, index - 1, percentage);
	// 	SetPedHeadOverlayColor(PlayerPedId(), 2, 1, colour - 1, 0);

	// 	actions.setEyebrows(index - 1);
	// 	actions.setEyebrows_2(percentage);
	// 	actions.setEyebrows_3(colour - 1);
	// });

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

	// const beardItem = NativeUI.CreateListItem("Facial Hair", beard, character.beard + 2, "Make changes to your Appearance.");
	// NativeUI.Menu.AddItem(submenu, beardItem);
	// NativeUI.setEventListener("menuItem", 'OnListChanged', (parent, item, index) => {
	// 	if (character.gender === 'Male') {
	// 		if (index === 1) {
	// 			NativeUI.MenuListItem.RemovePanelAt(beardItem, 1);
	// 			NativeUI.MenuListItem.RemovePanelAt(beardItem, 1);

	// 			SetPedHeadOverlay(PlayerPedId(), 1, 0, 0);
	// 			SetPedHeadOverlayColor(PlayerPedId(), 1, 1, 0, 0);

	// 			actions.setBeard(0);
	// 			actions.setBeard_2(0);
	// 			actions.setBeard_3(0);
	// 		} else {
	// 			if (NativeUI.MenuListItem.getPanelValue(beardItem, 1) === undefined) {
	// 				const beardColour = NativeUI.CreateColourPanel("Color", HairBrowColours);
	// 				const beardPercentage = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%");
	// 				NativeUI.MenuListItem.AddPanel(beardItem, beardPercentage);
	// 				NativeUI.MenuListItem.AddPanel(beardItem, beardColour);
	// 			}

	// 			const activeItem = NativeUI.MenuListItem.IndexToItem(beardItem, index);
	// 			const percentage = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 1) || 1);
	// 			const color = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 2) || 1);
	// 			SetPedHeadOverlay(PlayerPedId(), 1, index - 2, percentage)
	// 			SetPedHeadOverlayColor(PlayerPedId(), 1, 1, color - 1, 0)
	// 			actions.setBeard(index - 2);
	// 			actions.setBeard_2(percentage);
	// 			actions.setBeard_3(color);
	// 		}
	// 	}
	// });

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

	// const blemishesItem = NativeUI.CreateListItem("Skin Blemishes", blemishes, character.bodyb_1 + 1, "Make changes to your Appearance.");
	// NativeUI.Menu.AddItem(submenu, blemishesItem);
	// NativeUI.setEventListener(blemishesItem, 'OnListChanged', (parent, item, index) => {
	// 	if (index === 1) {
	// 		NativeUI.MenuListItem.RemovePanelAt(blemishesItem, 1);
	// 		NativeUI.MenuListItem.RemovePanelAt(blemishesItem, 1);

	// 		SetPedHeadOverlay(PlayerPedId(), 11, 0, 0);
	// 		SetPedHeadOverlayColor(PlayerPedId(), 11, 1, 0, 0);

	// 		actions.setBodyb_1(0);
	// 		actions.setBodyb_2(0);
	// 	} else {
	// 		if (NativeUI.MenuListItem.getPanelValue(blemishesItem, 1) === undefined) {
	// 			const blemishesColour = NativeUI.CreateColourPanel("Color", HairBrowColours);
	// 			const blemishesPercentage = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%");
	// 			NativeUI.MenuListItem.AddPanel(blemishesItem, blemishesPercentage);
	// 			NativeUI.MenuListItem.AddPanel(beardItem, blemishesColour);
	// 		}

	// 		const activeItem = NativeUI.MenuListItem.IndexToItem(blemishesItem, index);
	// 		const percentage = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 1) || 1);
	// 		SetPedHeadOverlay(PlayerPedId(), 11, index - 1, percentage)
	// 		actions.setBodyb_1(index - 1);
	// 		actions.setBeard_2(percentage);
	// 	}
	// });

	type PropsToUpdate<P extends keyof typeof character = keyof typeof character> = [P] | [P, P] | [P, P, P];

	function createOverlayItem(items: ReadonlyArray<string>, title: string, overlayId: number, defaultValueKey: keyof typeof character, propsToUpdate: PropsToUpdate, indexOffset = 0, colourType: 1 | 2 = 1) {
		const overlayItem = NativeUI.CreateListItem(title, items, (character[defaultValueKey] as number) + 1 - indexOffset, "Make changes to your Appearance.");
		NativeUI.Menu.AddItem(submenu, overlayItem);
		NativeUI.setEventListener(overlayItem, 'OnListChanged', (parent, item, index) => {
			if (index === 1) {
				for (let i = 0; i < Math.min(2, propsToUpdate.length - 1); i++) {
					NativeUI.MenuListItem.RemovePanelAt(overlayItem, 1);
				}

				SetPedHeadOverlay(PlayerPedId(), overlayId, 0, 0);
				SetPedHeadOverlayColor(PlayerPedId(), overlayId, colourType, 0, 0);

				propsToUpdate.forEach((prop) => {
					actions[`set${prop[0].toUpperCase()}${prop.slice(1)}` as keyof typeof actions](0 as never);
				});
			} else {
				const value = NativeUI.MenuListItem.getPanelValue(overlayItem, 1);
				console.log(value, value === undefined);
				if (!NativeUI.MenuListItem.doesPanelExist(overlayItem, 1)) {
					if (propsToUpdate.length > 1) {
						NativeUI.MenuListItem.AddPanel(overlayItem, NativeUI.CreatePercentagePanel("0%", "Opacity", "100%"));
					}

					if (propsToUpdate.length > 2) {
						NativeUI.MenuListItem.AddPanel(overlayItem, NativeUI.CreateColourPanel("Color", HairBrowColours));
					}
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
							value = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 1) || 1);
							SetPedHeadOverlay(PlayerPedId(), overlayId, (index - 1) + indexOffset, value);
						// Colour
						case 2:
							value = Number(NativeUI.MenuListItem.getPanelValue(activeItem, 2) || 1) - 1;
							SetPedHeadOverlayColor(PlayerPedId(), overlayId, colourType, value, 0);
					}

					actions[`set${prop[0].toUpperCase()}${prop.slice(1)}` as keyof typeof actions](value as never);
				});
			}
		});
	}

	const description = "Select to change your Appearance." as const;
	createOverlayItem(eyebrows, "Eyebrows", 2, 'eyebrows', ['eyebrows', 'eyebrows_2', 'eyebrows_3'], 0, 1);
	createOverlayItem(beard, "Facial Hair", 1, 'beard', ['beard', 'beard_2', 'beard_3'], 1, 1);
	createOverlayItem(blemishes, "Skin Blemishes", 11, 'bodyb_1', ['bodyb_1', 'bodyb_2']);

	/*
	local aging = { "None", "Crow's Feet", "First Signs", "Middle Aged", "Worry Lines", "Depression", "Distinguished", "Aged", "Weathered", "Wrinkled", "Sagging", "Tough Life", 
	"Vintage", "Retired", "Junkie", "Geriatric" }
	local agingitem = NativeUI.CreateListItem("Skin Aging", aging, Character['age_1'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(agingitem)
	agingitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Index == 1 then
			agingitem:RemovePanelAt(1)
			SetPedHeadOverlay(PlayerPedId(), 3,0,0.0)
			SetPedHeadOverlayColor(PlayerPedId(), 3, 1,	0,0)
			Character['age_1'] = 0
			Character['age_2'] = 0
		else
			if agingitem.Panels[1] == nil then
				local agingper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
				agingitem:AddPanel(agingper)
			end
			local ActiveItem = SelectedItem:IndexToItem(Index)
			local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
			SetPedHeadOverlay(PlayerPedId(), 3,Index-2,percentage)
			Character['age_1'] = Index-2
			Character['age_2'] = percentage
		end
	end

	local complexion = { "None", "Rosy Cheeks", "Stubble Rash", "Hot Flush", "Sunburn", "Bruised", "Alchoholic", "Patchy", "Totem", "Blood Vessels", "Damaged", "Pale", "Ghostly" }
	local complexitem = NativeUI.CreateListItem("Skin Complexion", complexion, Character['complexion_1'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(complexitem)
	complexitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Index == 1 then
			complexitem:RemovePanelAt(1)
			SetPedHeadOverlay(PlayerPedId(), 9,0,0.0)
			SetPedHeadOverlayColor(PlayerPedId(), 9, 1,	0,0)
			Character['complexion_1'] = 0
			Character['complexion_2'] = 0
		else
			if complexitem.Panels[1] == nil then
				local complexper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
				complexitem:AddPanel(complexper)
			end
			local ActiveItem = SelectedItem:IndexToItem(Index)
			local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
			SetPedHeadOverlay(PlayerPedId(), 6,Index-2,percentage)
			Character['complexion_1'] = Index-2
			Character['complexion_2'] = percentage
		end
	end

	local molefreckle = { "None", "Cherub", "All Over", "Irregular", "Dot Dash", "Over the Bridge", "Baby Doll", "Pixie", "Sun Kissed", "Beauty Marks", "Line Up", "Modelesque",
	"Occasional", "Speckled", "Rain Drops", "Double Dip", "One Sided", "Pairs", "Growth" }
	local moleitem = NativeUI.CreateListItem("Moles & Freckles", molefreckle, Character['moles_1'] + 1, "Make changes to your Appearance.")
	local moleopacity = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
	moleitem:AddPanel(moleopacity)
	submenu:AddItem(moleitem)
	moleitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Index == 1 then
			moleitem:RemovePanelAt(1)
			SetPedHeadOverlay(PlayerPedId(), 9,0,0.0)
			SetPedHeadOverlayColor(PlayerPedId(), 9, 1,	0,0)
			Character['moles_1'] = 0
			Character['moles_2'] = 0
		else
			if moleitem.Panels[1] == nil then
				local moleper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
				moleitem:AddPanel(moleper)
			end
			local ActiveItem = SelectedItem:IndexToItem(Index)
			local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
			SetPedHeadOverlay(PlayerPedId(), 9,Index-1,percentage)
			Character['moles_1'] = Index-1
			Character['moles_2'] = percentage
		end
	end

	local sundamage = { "None", "Uneven", "Sandpaper", "Patchy", "Rough", "Leathery", "Textured", "Coarse", "Rugged", "Creased", "Cracked", "Gritty" }
	local damageitem = NativeUI.CreateListItem("Skin Damage", sundamage, Character['sun_1'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(damageitem)
	damageitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Index == 1 then
			damageitem:RemovePanelAt(1)
			damageitem:RemovePanelAt(1)
			SetPedHeadOverlay(PlayerPedId(), 7,0,0.0)
			SetPedHeadOverlayColor(PlayerPedId(), 7, 1,	0,0)
			Character['sun_1'] = 0
			Character['sun_2'] = 0
		else
			if damageitem.Panels[1] == nil then
				local damagecolor = NativeUI.CreateColourPanel("Color", hairbrowcolors)
				local damageper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
				damageitem:AddPanel(damageper)
				damageitem:AddPanel(damagecolor)
			end
			local ActiveItem = SelectedItem:IndexToItem(Index)
			local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
			SetPedHeadOverlay(PlayerPedId(), 7,Index-2,percentage)
			Character['sun_1'] = Index-2
			Character['sun_2'] = percentage
		end
	end

	local eyeColorNames = { "Green", "Emerald", "Light Blue", "Ocean Blue", "Light Brown", "Dark Brown", "Hazel", "Dark Gray", "Light Gray", "Pink", "Yellow", "Purple", "Blackout", 
	"Shades of Gray", "Tequila Sunrise", "Atomic", "Warp", "ECola", "Space Ranger", "Ying Yang", "Bullseye", "Lizard", "Dragon", "Extra Terrestrial", "Goat", "Smiley", "Possessed", 
	"Demon", "Infected", "Alien", "Undead", "Zombie"}
	local eyecoloritem = NativeUI.CreateListItem("Eye Color", eyeColorNames, Character['eye_color'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(eyecoloritem)
	eyecoloritem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		SetPedEyeColor(PlayerPedId(), Index - 1, 0, 1)
		Character['eye_color'] = Index-1
	end

	local makeup = { "None", "Smoky Black", "Bronze", "Soft Gray", "Retro Glam", "Natural Look", "Cat Eyes", "Chola", "Vamp", "Vinewood Glamour", "Bubblegum", "Aqua Dream", "Pin up", "Purple Passion", "Smoky Cat Eye", "Smoldering Ruby", "Pop Princess"}
	local makeupitem = NativeUI.CreateListItem("Makeup", makeup, Character['makeup_1'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(makeupitem)
	makeupitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Index == 1 then
			makeupitem:RemovePanelAt(1)
			makeupitem:RemovePanelAt(1)
			SetPedHeadOverlay(PlayerPedId(), 4,0,0.0)
			SetPedHeadOverlayColor(PlayerPedId(), 4, 1,	0,0)
			Character['makeup_1'] = 0
			Character['makeup_2'] = 0
			Character['makeup_3'] = 0
		else
			if makeupitem.Panels[1] == nil then
				local makeupitemcolor = NativeUI.CreateColourPanel("Color", hairbrowcolors)
				local makeupitemper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
				makeupitem:AddPanel(makeupitemper)
				makeupitem:AddPanel(makeupitemcolor)
			end
			local ActiveItem = SelectedItem:IndexToItem(Index)
			local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
			local color = (ActiveItem.Panels and ActiveItem.Panels[2] or 1)
			SetPedHeadOverlay(PlayerPedId(), 4,Index-2,percentage)
			SetPedHeadOverlayColor(PlayerPedId(), 4, 1,	color-1,0)
			Character['makeup_1'] = Index-2
			Character['makeup_2'] = percentage
			Character['makeup_3'] = color-1
		end
	end

	local blush = { "None", "Full", "Angled", "Round", "Horizontal", "High", "Sweetheart", "Eighties" }
	local blushitem = NativeUI.CreateListItem("Blusher", blush, Character['blush_1'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(blushitem)
	blushitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Character["gender"] == "Male" then
			blushitem:Index(Character["blush_1"] + 1)
			ShowNotification("Blusher unavailable for Male characters.")
		else
			if Index == 1 then
				blushitem:RemovePanelAt(1)
				blushitem:RemovePanelAt(1)
				SetPedHeadOverlay(PlayerPedId(), 5,0,0.0)
				SetPedHeadOverlayColor(PlayerPedId(), 5, 1,	0,0)
				Character['blush_1'] = 0
				Character['blush_2'] = 0
				Character['blush_3'] = 0
			else
				if blushitem.Panels[1] == nil then
					local blushcolor = NativeUI.CreateColourPanel("Color", hairbrowcolors)
					local blushper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
					blushitem:AddPanel(blushper)
					blushitem:AddPanel(blushcolor)
				end
				local ActiveItem = SelectedItem:IndexToItem(Index)
				local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
				local color = (ActiveItem.Panels and ActiveItem.Panels[2] or 1)
				SetPedHeadOverlay(PlayerPedId(), 5,Index-2,percentage)
				SetPedHeadOverlayColor(PlayerPedId(), 5, 2,	color-1,0)
				Character['blush_1'] = Index-2
				Character['blush_2'] = percentage
				Character['blush_3'] = color-1
			end
		end
	end
	
	local lipstick =  { "None", "Color Matte", "Color Gloss", "Lined Matte", "Lined Gloss", "Heavy Lined Matte", "Heavy Lined Gloss", "Lined Nude Matte", "Liner Nude Gloss", "Smudged", "Geisha" }
	local lipstickitem = NativeUI.CreateListItem("Lipstick", lipstick, Character['lipstick_1'] + 1, "Make changes to your Appearance.")
	submenu:AddItem(lipstickitem)
	lipstickitem.OnListChanged = function(ParentMenu, SelectedItem, Index)
		if Index == 1 then
			lipstickitem:RemovePanelAt(1)
			lipstickitem:RemovePanelAt(1)
			SetPedHeadOverlay(PlayerPedId(), 8,0,0.0)
			SetPedHeadOverlayColor(PlayerPedId(), 8, 1,	0,0)
			Character['lipstick_1'] = 0
			Character['lipstick_2'] = 0
			Character['lipstick_3'] = 0
		else
			if lipstickitem.Panels[1] == nil then
				local lipstickcolor = NativeUI.CreateColourPanel("Color", hairbrowcolors)
				local lipstickper = NativeUI.CreatePercentagePanel("0%", "Opacity", "100%")
				lipstickitem:AddPanel(lipstickper)
				lipstickitem:AddPanel(lipstickcolor)
			end
			local ActiveItem = SelectedItem:IndexToItem(Index)
			local percentage = (ActiveItem.Panels and ActiveItem.Panels[1] or 1.0)
			local color = (ActiveItem.Panels and ActiveItem.Panels[2] or 1)
			SetPedHeadOverlay(PlayerPedId(), 8,Index-2,percentage)
			SetPedHeadOverlayColor(PlayerPedId(), 8, 1,	color-1,0)
			Character['lipstick_1'] = Index-2
			Character['lipstick_2'] = percentage
			Character['lipstick_3'] = color-1
		end
	end
	*/

	NativeUI.setEventListener(parentMenu, 'OnMenuChanged', (parent, menu) => {
		if (menu === submenu) {
			// CreateSkinCam('face')
		}

		let hairItems = hairIndices;
		if (haircutNames[character.gender.toLowerCase() as keyof typeof haircutNames]) {
			hairItems = [...Array(haircutNames[character.gender.toLowerCase() as keyof typeof haircutNames].length)].map((_, i) => `${i + 1}`);
		}

		NativeUI.MenuListItem.setProp(hairItem, 'Items', hairItems);
	})

	/*
	menu.OnMenuChanged = function(parent, menu, whateverthefuck)
		if menu == submenu then
			CreateSkinCam('face')
		end

		if Character["gender"] == "Male" then
			hairitem.Items = MHairNames
		elseif Character["gender"] == "Female" then
			hairitem.Items = FHairNames
		else
			hairitem.Items = haircuts
		end
	end
	submenu.OnMenuClosed = function()
		CreateSkinCam('body')
	end*/
}