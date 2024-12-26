/* This is the JSON root */
interface IClothingDump {
    'mp_f_freemode_01': PedClothing;
    'mp_m_freemode_01': PedClothing;
}

export type PedClothing = Record<PedComponent | PedProp, ComponentDrawables>;
export type ComponentDrawables = Record<number, DrawableTextures>;
type DrawableTextures = Record<number, ComponentData>;
interface ComponentData {
    label: string;
    locate: `${number}` | '';
};

type PedComponent = |
    'head' |
    'beard' |
    'hair' |
    'upper' |
    'lower' |
    'hands' |
    'feet' |
    'teeth' |
    'accessories' |
    'armour' |
    'badge' |
    'torso';

type PedProp = |
    'p_head' |
    'p_eyes' |
    'p_ears' |
    'p_mouth' |
    'p_lhand' |
    'p_rhand' |
    'p_lwrist' |
    'p_rwrist' |
    'p_lhip' |
    'p_lfoot' |
    'p_rfoot' |
    'ph_lhand' |
    'ph_rhand';

/**
 * Clothes dump (https://github.com/tomezpl/gtav-clothing-dumper)
 * 
 * This should only be loaded once as it's a quite massive JSON
 */
export const clothingStore = JSON.parse(LoadResourceFile(GetCurrentResourceName(), 'assets/clothesdump/dist/clothingdump.patched.json')) as IClothingDump;