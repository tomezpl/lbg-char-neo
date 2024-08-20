/* This is the JSON root */
interface IClothingDump {
    "mp_f_freemode_01": PedClothing;
    "mp_m_freemode_01": PedClothing;
}

type PedClothing = Record<PedComponent, ComponentDrawables>;
type ComponentDrawables = Record<number, DrawableTextures>;
type DrawableTextures = Record<number, GxtLabel>;
type GxtLabel = string;

type PedComponent = |
    "head" |
    "beard" |
    "hair" |
    "upper" |
    "lower" |
    "hands" |
    "feet" |
    "teeth" |
    "accessories" |
    "armour" |
    "badge" |
    "torso";

export const clothingStore = JSON.parse(LoadResourceFile('lbg-char', 'assets/clothesdump/dist/clothingdump.json')) as IClothingDump;