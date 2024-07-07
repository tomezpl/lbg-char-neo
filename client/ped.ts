import { ComponentVariation, PedComponents } from "constants/clothing";
import { DefaultHairDecor, HairDecor } from "constants/hair";
import { FemaleOutfits, MaleOutfits } from "constants/outfit";
import { store } from "state"

export function ChangeComponents(shouldChangeModel?: boolean) {
	const Character = store.character;

	const immediate = setImmediate(() => {
		//the shouldChangeModel parameter is here for legacy purposes, because I am lazy to change up any lines of code
		//containing it. it is not requires, as it is not used.
		SetPedDefaultComponentVariation(PlayerPedId());
		SetPedHeadBlendData(PlayerPedId(), Character["mom"], Character["dad"], 0, Character["mom"], Character["dad"], 0, Character["resemblance"], Character["skintone"], 0, true);
		SetPedComponentVariation(PlayerPedId(), 2, Character["hair"], 0, 2);
		SetPedHairColor(PlayerPedId(), Character['hair_color_1'], 0);

		ClearPedDecorations(PlayerPedId());
		if (HairDecor[Character.gender][Character["hair"]] !== undefined) {
			AddPedDecorationFromHashes(PlayerPedId(), ...(HairDecor[Character.gender][GetPedDrawableVariation(PlayerPedId(), 2)]));
		} else {
			AddPedDecorationFromHashes(PlayerPedId(), ...DefaultHairDecor);
		}
		SetPedHeadOverlay(PlayerPedId(), 8, Character['lipstick_1'], Character['lipstick_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 8, 1, Character['lipstick_3'], 0)
		SetPedHeadOverlay(PlayerPedId(), 2, Character['eyebrows'], Character['eyebrows_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 2, 1, Character['eyebrows_3'], 0)
		SetPedHeadOverlay(PlayerPedId(), 3, Character['age_1'], Character['age_2'])
		SetPedHeadOverlay(PlayerPedId(), 7, Character['sun_1'], Character['sun_2'])
		SetPedHeadOverlay(PlayerPedId(), 6, Character['complexion_1'], Character['complexion_2'])
		SetPedHeadOverlay(PlayerPedId(), 9, Character['moles_1'], Character['moles_2'])
		// SetPedEyeColor(PlayerPedId(), Character['eye_color'], 0, 1)
		SetPedEyeColor(PlayerPedId(), Character['eye_color']);
		SetPedHeadOverlay(PlayerPedId(), 4, Character['makeup_1'], Character['makeup_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 4, 1, Character['makeup_3'], 0)
		SetPedFaceFeature(PlayerPedId(), 19, Character['neck_thick'])
		SetPedFaceFeature(PlayerPedId(), 18, Character['chin_hole'])
		SetPedFaceFeature(PlayerPedId(), 17, Character['chin_width'])
		SetPedFaceFeature(PlayerPedId(), 16, Character['chin_length'])
		SetPedFaceFeature(PlayerPedId(), 15, Character['chin_height'])
		SetPedFaceFeature(PlayerPedId(), 14, Character['jaw_2'])
		SetPedFaceFeature(PlayerPedId(), 13, Character['jaw_1'])
		SetPedFaceFeature(PlayerPedId(), 12, Character['lips_thick'])
		SetPedFaceFeature(PlayerPedId(), 11, Character['eye_open'])
		SetPedFaceFeature(PlayerPedId(), 10, Character['cheeks_3'])
		SetPedFaceFeature(PlayerPedId(), 9, Character['cheeks_2'])
		SetPedFaceFeature(PlayerPedId(), 8, Character['cheeks_1'])
		SetPedFaceFeature(PlayerPedId(), 6, Character['eyebrows_6'])
		SetPedFaceFeature(PlayerPedId(), 7, Character['eyebrows_5'])
		SetPedFaceFeature(PlayerPedId(), 5, Character['nose_6'])
		SetPedFaceFeature(PlayerPedId(), 4, Character['nose_5'])
		SetPedFaceFeature(PlayerPedId(), 3, Character['nose_4'])
		SetPedFaceFeature(PlayerPedId(), 2, Character['nose_3'])
		SetPedFaceFeature(PlayerPedId(), 1, Character['nose_2'])
		SetPedFaceFeature(PlayerPedId(), 0, Character['nose_1'])
		const outfits = Character.gender === "Male" ? MaleOutfits : FemaleOutfits;
		if (outfits[Character.outfit]) {
			Object.entries(outfits[Character.outfit]).forEach((entry) => {
				let [component, [drawable, texture]] = entry as unknown as [number | string, ComponentVariation];

				// Reverse-map the component name to component ID if needed.
				if (isNaN(Number(component))) {
					component = PedComponents[component as keyof typeof PedComponents];
				}

				SetPedComponentVariation(PlayerPedId(), Number(component), drawable, texture, 2);
			});
		}

		if (Character["gender"] === "Male") {

			SetPedHeadOverlay(PlayerPedId(), 1, Character['beard'], Character['beard_2'])
			SetPedHeadOverlayColor(PlayerPedId(), 1, 1, Character['beard_3'], 0)
		} else if (Character["gender"] === "Female") {
			SetPedHeadOverlay(PlayerPedId(), 5, Character['blush_1'], Character['blush_2'])
			SetPedHeadOverlayColor(PlayerPedId(), 5, 2, Character['blush_3'], 0)
		}

		if (Character["glasses"] === 0) {
			if (Character["gender"] === "Male") {
				SetPedPropIndex(PlayerPedId(), 1, 11, 0, false);
			} else {
				SetPedPropIndex(PlayerPedId(), 1, 5, 0, false);
			}
		} else {
			if (Character["gender"] === "Male") {
				SetPedPropIndex(PlayerPedId(), 1, 5, 0, false);
			} else {
				SetPedPropIndex(PlayerPedId(), 1, 11, 0, false);
			}
		}

		clearImmediate(immediate);
	});
}
export function RefreshModel(force = false, character = store.character) {
	console.log('Refreshmodel')
	const { mdhash } = store;
	const { mom, dad, resemblance, skintone } = character || store.character;
	const tickerHandle = setTick(() => {
		if (force || GetEntityModel(PlayerPedId()) !== mdhash) {
			if (!HasModelLoaded(mdhash)) {
				RequestModel(mdhash)
			}
			else {
				SetPlayerModel(PlayerId(), mdhash)
				SetPedHeadBlendData(PlayerPedId(), mom, dad, 0, mom, dad, 0, resemblance, skintone, 0, true);
				ChangeComponents();
				clearTick(tickerHandle);
			}
		}
	});
}
