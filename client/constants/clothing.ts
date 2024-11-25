/** Ped component slot names mapped to their IDs and vice-versa
 * 
 * Don't mess with the order of these as it needs to match the game's IDs
 */
export enum PedComponents {
    'head',
    'beard',
    'hair',
    'upper',
    'lower',
    'hands',
    'feet',
    'teeth',
    'accessories',
    'armour',
    'badge',
    'torso'
};

/** A tuple type defining a component's drawable and texture IDs */
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

/**
 * Returns a GXT label for a given clothing component's locate value.
 * 
 * The assumption here is that the locate value of a clothing component can be used to find the category/group to place it in in the shop UI.
 * This function attempts to return the correct GXT label to find the clothing category's name.
 */
export function GetTextLabelForLocate(locate: number, label?: string): `CSHOP_ITEM${number}` {
    // The following act as "control points" for the mapper.
    // Essentially, the tuples are key-value pairs where the first element is the key (the "locate" value from an example component in a shop metadata file),
    // and the second element is the value: a number that, when appended to the CSHOP_ITEM string,
    // produces a GXT label pointing at the string that names the example component's group.
    // 
    // These were found by manually compiling a list of clothing items from various categories, bruteforce searching from all CSHOP_ITEM labels,
    // then mapping the numbers from the labels to the clothing items' locate values.
    const mappings = [
        [131, 170],
        [122, 161],
        [189, 230],
        [16, 8],
        [167, 207],
        [248, 288],
        [249, 207],
        [52, 27],
        [9, 111],
        [10, 93],
        [11, 3],
        [12, 4],
        [19, 11],
        [54, 29],
        [48, 91],
        [235, 276],
        [250, 247],
        [251, 10],
        [252, 5],
        [253, 297],
        [255, 4],
        [256, 300],
        [272, 316],
        [187, 228],
        [22, 54],
        [7, 46],
        [172, 210],
        [173, 214],
        [21, 53],
        [27, 130],

        // if lower body, -1 should match 198
        [-1, label.match(/^CLO_[A-Z]+_L_/) ? 198 : 197],

        [8, 92],

        // For uppr components from drug wars, locate 9 seems to point to Denim Jackets. Otherwise it's Bikinis
        [9, label.startsWith('CLO_X6F_U') ? 111 : 11],

        [20, 52],
        [23, 57],
        [103, 63],
        [171, 212],
        [241, 256],
        [242, 283],
        [111, 150],
        [28, 12],
        [49, 23],
        [60, 56],
        [55, 75],
        [58, 48],
        [295, 340],
        [296, 340],
        [37, 95],
        [34, 94],
        [31, 14],
        [39, 19],
        [36, 96],
        [40, 34],
        [30, 51],
        [41, 35],
        [42, 55],
        [46, 22],
        [47, 90],
        [45, 77],
        [44, 21]
    ] as const;

    // Find the highest locate that's less than or equal to the input locate,
    // then take the target offset from the control point, and apply that to the input locate.
    // Yes. This is confusing, and I don't understand why it works, but it does.
    let offset: number | null = null;
    const sortedMappings = [...mappings].sort(([a], [b]) => Math.max(-1, Math.min(1, a - b)))
    for (let i = 0; i < sortedMappings.length; i++) {
        if (i === 0 || sortedMappings[i][0] <= locate) {
            offset = sortedMappings[i][1] - sortedMappings[i][0];
        } else if (sortedMappings[i][0] > locate) {
            // console.log(`${locate} was between ${sortedMappings[i - 1]?.[0] || 0} and ${sortedMappings[i][0]} so chose offset ${offset}`);
            break;
        }
    }

    // This is an incredibly dumb fix for some polo shirts from The Contract and vests from Execs & Other Crims that both have locate=-99.
    // I hate this.
    if (locate === -99) {
        const theContractPolosMatch = label.match(/^CLO_FX[A-Z]_U_(?<drawable>[0-1])_[0-9]+$/);
        if (theContractPolosMatch) {
            offset = 0;
            locate = theContractPolosMatch.groups?.drawable === '1' ? 233 : 8;
        }
        else {
            const execsAndCrimsVestMatch = label.match(/^CLO_EX[A-Z]_AV_[1-2]_[0-9]+$/);
            if (execsAndCrimsVestMatch) {
                offset = 0;
                locate = 177;
            }
        }
    }

    return `CSHOP_ITEM${locate + offset}`;
}