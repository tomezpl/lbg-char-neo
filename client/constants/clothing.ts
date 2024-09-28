export enum PedComponents {
    "head",
    "beard",
    "hair",
    "upper",
    "lower",
    "hands",
    "feet",
    "teeth",
    "accessories",
    "armour",
    "badge",
    "torso"
};

export type ComponentVariation = [drawable: number, texture: number];

/**
 * Top-level clothing item groups. The GXT labels for each can be looked up by CSHOP_ITEM{enum}
 */
export enum ClothingItemCategories {
    Outfits = 36,
    Tops,
    Pants,
    Shoes,
    Hats,
    Masks,
}

/** The offsets from DLC items' <locate> values to their respective CSHOP_ITEM indices. If a DLC isn't defined here, assume 41 */
export const ClothingItemLocateOffsets = {
    /** Heists DLC */
    HST: 39,
    131: 39,
    165: 40,
    30: 21,

    // For some reason one of the biker fishnet denims has both locate=30 and locate=-99 and I assume the -99 takes precedence?
    '-99': 150,

    44: -23,

    20: 143,
    169: -6,

    210: 25,

    153: 39,

    19: -8,

    22: 32,

    CLO_X6: 44
} as const;

export const DLCG9Offsets = {
    CLO_X6: {
        [PedComponents.torso]: -10
    }
} as const;

export function getDLCItemOffset(compType: PedComponents, label: string) {
    return Object.entries(DLCG9Offsets).find(([key]) => label.startsWith(key))?.[1][compType] || 0;
}

export const LastPreGen9ECLabel = 'CLO_SB' as const;

export const KnownGen9ECLabels = [
    'CLO_E1'
] as const;

/**
 * Returns a GXT label for a given clothing component's locate value.
 */
export function GetTextLabelForLocate(locate: number, dlcPack?: Extract<keyof typeof ClothingItemLocateOffsets, string>): `CSHOP_ITEM${number}` {

    let offset: number | null = null;
    if (dlcPack) {
        offset = Object.entries(ClothingItemLocateOffsets).find(([key]) => `${key}`.includes('_') && dlcPack.includes(key))?.[1];
    }
    offset ??= ClothingItemLocateOffsets[locate as unknown as keyof typeof ClothingItemLocateOffsets] ?? 41;
    return `CSHOP_ITEM${locate + offset}`;
}