import { PedComponents, ComponentVariation } from './clothing'

export type Outfit = Partial<Record<Extract<PedComponents, number>, ComponentVariation>>;

/**
 * Preset outfits for mp_m_freemode_01
 */
export const MaleOutfits: Array<Outfit> = [
	{
		3: [18, 0],
		11: [6, 5],
		8: [2, 2],
		4: [0, 4],
		6: [0, 10]
	},
	{
		6: [0, 10],
		3: [18, 0],
		11: [64, 0],
		4: [1, 0],
		8: [2, 1]
	},
	{
		6: [0, 10],
		3: [52, 0],
		11: [0, 0],
		4: [0, 0]
	},
	{
		6: [25, 0],
		8: [15, 0],
		11: [55, 0],
		3: [52, 0],
		4: [35, 0]
	},
	{
		11: [47, 0],
		4: [0, 0],
		6: [0, 10],
		3: [52, 0],
		8: [15, 0]
	}
];

/**
 * Preset outfits for mp_f_freemode_01
 */
export const FemaleOutfits: Array<Outfit> = [
	{
		3: [60, 0],
		11: [8, 2],
		8: [0, 6],
		4: [11, 1],
		6: [4, 0]
	},
	{
		6: [4, 0],
		3: [64, 0],
		11: [31, 0],
		4: [25, 0],
		8: [5, 0]
	},
	{
		6: [0, 0],
		3: [63, 0],
		11: [0, 0],
		4: [0, 0]
	},
	{
		6: [25, 0],
		8: [15, 0],
		11: [48, 0],
		3: [70, 0],
		4: [34, 0]
	},
	{
		6: [1, 1],
		11: [9, 9],
		4: [11, 1],
		3: [67, 0],
		8: [8, 0]
	}
]