import { PropsCollection } from 'constants/character';
import { ComponentVariation, PedComponents } from 'constants/clothing';
import { DefaultHairDecor, HairDecor } from 'constants/hair';
import { FemaleOutfits, MaleOutfits, Outfit } from 'constants/outfit';
import { store } from 'state'
import { Logger } from 'utils/logger';

/**
 * Applies a character's appearance: facial features, overlays, hair, clothing, etc.
 * 
 * The currently active character from {@link store} is used for this.
 */
export function ChangeComponents(Character = store.character) {
	Logger.log('Changing player ped components/face features/overlays/decorations.');

	const immediate = setImmediate(() => {
		SetPedDefaultComponentVariation(PlayerPedId());
		SetPedHeadBlendData(PlayerPedId(), Character['mom'], Character['dad'], 0, Character['mom'], Character['dad'], 0, Character['resemblance'], Character['skintone'], 0, true);
		SetPedComponentVariation(PlayerPedId(), 2, Character['hair'], 0, 2);
		SetPedHairColor(PlayerPedId(), Character['hair_color_1'], 0);

		ClearPedDecorations(PlayerPedId());
		if (HairDecor[Character.gender][Character['hair']] !== undefined) {
			AddPedDecorationFromHashes(PlayerPedId(), ...(HairDecor[Character.gender][GetPedDrawableVariation(PlayerPedId(), 2)]));
		} else {
			AddPedDecorationFromHashes(PlayerPedId(), ...DefaultHairDecor);
		}
		SetPedHeadOverlay(PlayerPedId(), 8, Character['lipstick_1'], Character['lipstick_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 8, 2, Character['lipstick_3'], 0)
		SetPedHeadOverlay(PlayerPedId(), 2, Character['eyebrows'], Character['eyebrows_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 2, 1, Character['eyebrows_3'], 0)
		SetPedHeadOverlay(PlayerPedId(), 3, Character['age_1'], Character['age_2'])
		SetPedHeadOverlay(PlayerPedId(), 7, Character['sun_1'], Character['sun_2'])
		SetPedHeadOverlay(PlayerPedId(), 6, Character['complexion_1'], Character['complexion_2'])
		SetPedHeadOverlay(PlayerPedId(), 9, Character['moles_1'], Character['moles_2'])
		// SetPedEyeColor(PlayerPedId(), Character['eye_color'], 0, 1)
		SetPedEyeColor(PlayerPedId(), Character['eye_color']);
		SetPedHeadOverlay(PlayerPedId(), 4, Character['makeup_1'], Character['makeup_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 4, 2, Character['makeup_3'], 0)
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

		const outfits = Character.gender === 'Male' ? MaleOutfits : FemaleOutfits;
		const hasCustomOutfit = Object.keys((Character.customOutfit as Outfit) || {}).length > 0;

		// If the character has a legacy preset outfit applied and no custom outfit set, continue with the legacy outfit logic.
		if (!hasCustomOutfit && outfits[Character.outfit]) {
			Object.entries(outfits[Character.outfit]).forEach((entry) => {
				// eslint-disable-next-line prefer-const
				let [component, [drawable, texture]] = entry as unknown as [number | string, ComponentVariation];

				// Reverse-map the component name to component ID if needed.
				if (isNaN(Number(component))) {
					component = PedComponents[component as keyof typeof PedComponents];
				}

				SetPedComponentVariation(PlayerPedId(), Number(component), drawable, texture, 2);
			});
		} else if (hasCustomOutfit) {
			// Otherwise if we do have a custom outfit, just apply each component variation.
			Object.entries(Character.customOutfit as Outfit).forEach((entry) => {
				const [component, [drawable, texture]] = entry as [`${number}`, ComponentVariation];

				SetPedComponentVariation(PlayerPedId(), Number(component), drawable, texture, 2);
			})
		}

		// if (Character['gender'] === 'Male') {
		Logger.log(`setting beard ${Character.beard} ${Character.beard_2} ${Character.beard_3}`);
		SetPedHeadOverlay(PlayerPedId(), 1, Character['beard'] - 1, Character['beard_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 1, 1, Character['beard_3'], 0)
		// } else if (Character['gender'] === 'Female') {
		SetPedHeadOverlay(PlayerPedId(), 5, Character['blush_1'], Character['blush_2'])
		SetPedHeadOverlayColor(PlayerPedId(), 5, 2, Character['blush_3'], 0)
		// }

		// If the active character does not have custom props, then just continue with the legacy glasses logic.
		if (Object.keys(typeof Character.customProps === 'object' ? (Character.customProps as PropsCollection) : {}).length === 0) {
			if (Character['glasses'] === 0) {
				if (Character['gender'] === 'Male') {
					SetPedPropIndex(PlayerPedId(), 1, 11, 0, false);
				} else {
					SetPedPropIndex(PlayerPedId(), 1, 5, 0, false);
				}
			} else {
				if (Character['gender'] === 'Male') {
					SetPedPropIndex(PlayerPedId(), 1, 5, 0, false);
				} else {
					SetPedPropIndex(PlayerPedId(), 1, 11, 0, false);
				}
			}
		} else {
			// If the character does have custom props, apply them all here.
			Object.entries(Character.customProps as PropsCollection).forEach((entry) => {
				const [prop, [drawable, texture]] = entry as [`${number}`, ComponentVariation];

				SetPedPropIndex(PlayerPedId(), Number(prop), drawable, texture || 0, true);
			});
		}

		clearImmediate(immediate);
	});
}

/**
 * Re-sets the player ped's model.
 * @param force False to only refresh if the gender (ped model) changed, true to refresh regardless.
 * @param character Character data to apply.
 */
export function RefreshModel(force = false, character = store.character) {
	Logger.log(`Refreshing player ped (force: ${force === true})`);
	const { mdhash } = store;
	const { mom, dad, resemblance, skintone } = character || store.character;
	const tickerHandle = setTick(() => {
		if (force || GetEntityModel(PlayerPedId()) !== mdhash) {
			if (!HasModelLoaded(mdhash)) {
				RequestModel(mdhash)
			}
			else {
				Logger.log('Changing player ped model');
				SetPlayerModel(PlayerId(), mdhash);
				emit('lbg-char-neo:pedChanged');
				Logger.log(`setting resemblance to ${resemblance} and skin tone to ${skintone}`);
				SetPedHeadBlendData(PlayerPedId(), mom, dad, 0, mom, dad, 0, resemblance, skintone, 0, true);
				ChangeComponents(character || store.character);
				clearTick(tickerHandle);
			}
		}
	});
}
