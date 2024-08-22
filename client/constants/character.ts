export const MPMale = "mp_m_freemode_01";
export const MPFemale = "mp_f_freemode_01";

const defaultCharacter = Object.freeze({
	resemblance: 0.8,
	skintone: 0.9,
	ddad: 0,
	dmom: 0,
	mom: 21,
	dad: 0,
	gender: "Male",
	ogd: "M",
	lcgd: "male",
	hair: 13,
	hair_color_1: 0,
	outfit: 0,
	beard: 0,
	beard_2: 1,
	beard_3: 26,
	eyebrows: 1,
	eyebrows_2: 1,
	eyebrows_3: 2,
	blush_1: 0,
	blush_2: 1,
	blush_3: 0,
	sun_1: 0,
	sun_2: 1,
	complexion_1: 0,
	complexion_2: 1,
	bodyb_1: 0,
	bodyb_2: 1,
	age_1: 0,
	age_2: 1,
	eye_color: 0,
	makeup_1: 0,
	makeup_2: 1,
	makeup_3: 0,
	lipstick_1: 0,
	lipstick_2: 1,
	lipstick_3: 0,
	moles_1: 0,
	moles_2: 1,
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
});

type Writable<T> = {
	-readonly [K in keyof T]: T[K];
}

export type Character = Writable<Omit<typeof defaultCharacter, "gender" | "ogd" | "lcgd">> & {
	gender: "Male" | "Female";
	ogd: "M" | "F";
	lcgd: "male" | "female";
};

export const DefaultCharacter: Readonly<Character> = defaultCharacter as Readonly<Character>;