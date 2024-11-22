import { ComponentVariation } from "./clothing";
import type { Outfit } from "./outfit";

export const MPMale = "mp_m_freemode_01";
export const MPFemale = "mp_f_freemode_01";

const defaultCharacter = Object.freeze({
	resemblance: 0.8,
	skintone: 0.9,
	ddad: 0,
	dmom: 0,
	mom: 21,
	dad: 0,
	gender: "Male" as const,
	ogd: "M" as const,
	lcgd: "male" as const,
	hair: 13,
	hair_color_1: 0,
	outfit: 0,
	beard: 0,
	beard_2: 0,
	beard_3: 25,
	eyebrows: 0,
	eyebrows_2: 1,
	eyebrows_3: 1,
	blush_1: 0,
	blush_2: 0,
	blush_3: 0,
	sun_1: 0,
	sun_2: 0,
	complexion_1: 0,
	complexion_2: 0,
	bodyb_1: 0,
	bodyb_2: 0,
	age_1: 0,
	age_2: 0,
	eye_color: 0,
	makeup_1: 0,
	makeup_2: 0,
	makeup_3: 0,
	lipstick_1: 0,
	lipstick_2: 0,
	lipstick_3: 0,
	moles_1: 0,
	moles_2: 0,
	neck_thick: 0.0,
	chin_hole: 0.0,
	chin_width: 0.0,
	chin_length: 0.0,
	chin_height: 0.0,
	jaw_1: 0.0,
	jaw_2: 0.0,
	lips_thick: 0.0,
	eye_open: 0.0,
	cheeks_3: 0.0,
	cheeks_2: 0.0,
	cheeks_1: 0.0,
	eyebrows_6: 0.0,
	eyebrows_5: 0.0,
	nose_6: 0.0,
	nose_5: 0.0,
	nose_4: 0.0,
	nose_3: 0.0,
	nose_2: 0.0,
	nose_1: 0.0,
	glasses: 0,
	customOutfit: undefined,
	customProps: undefined,
	version: '2' as const,
});

type Writable<T> = {
	-readonly [K in keyof T]: T[K];
}

/**
 * The overlay/component styles in this object are 0-indexed in order to fit the game's native usage.

 * Keep in mind the UI expects 1-indexed IDs due to being implemented in Lua.
 */
export type Character = Writable<Omit<typeof defaultCharacter, "gender" | "ogd" | "lcgd">> & {
	gender: "Male" | "Female";
	ogd: "M" | "F";
	lcgd: "male" | "female";
	customOutfit?: Outfit;
	customProps?: Record<number, ComponentVariation>;

	/** 2.0 is incompatible with 1.x character data */
	version: '2';
};

export type LegacyCharacter = Omit<Character, 'version'>;

export const DefaultCharacter: Readonly<Character> = defaultCharacter;

export const SavedCharacterSlotPrefix = 'lbg-char-neo:saved-char-';