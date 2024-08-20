import type { Texture } from "types/texture";

export const DefaultHairDecor: Texture = ["mpbeach_overlays", "FM_hair_fuzz"];

export type HairDecorCollection = Record<"Female" | "Male", Record<number, Texture>>;

export const HairDecor: Readonly<HairDecorCollection> = Object.freeze({
    Female: {
        0: ["", ""], //who doesn't like a shiny head from time to time?
        1: ["multiplayer_overlays", "NG_F_Hair_001"],
        2: ["multiplayer_overlays", "NG_F_Hair_002"],
        3: ["multiplayer_overlays", "FM_F_Hair_003_a"],
        4: ["multiplayer_overlays", "NG_F_Hair_004"],
        5: ["multiplayer_overlays", "FM_F_Hair_005_a"],
        6: ["multiplayer_overlays", "FM_F_Hair_006_a"],
        7: ["multiplayer_overlays", "NG_F_Hair_007"],
        8: ["multiplayer_overlays", "NG_F_Hair_008"],
        9: ["multiplayer_overlays", "NG_F_Hair_009"],
        10: ["multiplayer_overlays", "NG_F_Hair_010"],
        11: ["multiplayer_overlays", "NG_F_Hair_011"],
        12: ["multiplayer_overlays", "NG_F_Hair_012"],
        13: ["multiplayer_overlays", "FM_F_Hair_013_a"],
        14: ["multiplayer_overlays", "FM_F_Hair_014_a"],
        15: ["multiplayer_overlays", "NG_M_Hair_015"],
        16: ["multiplayer_overlays", "NGBea_F_Hair_000"],
        17: ["mpbusiness_overlays", "FM_Bus_F_Hair_a"],
        18: ["multiplayer_overlays", "NG_F_Hair_007"],
        19: ["multiplayer_overlays", "NGBus_F_Hair_000"],
        20: ["multiplayer_overlays", "NGBus_F_Hair_001"],
        21: ["multiplayer_overlays", "NGBea_F_Hair_001"],
        22: ["mphipster_overlays", "FM_Hip_F_Hair_000_a"],
        23: ["multiplayer_overlays", "NGInd_F_Hair_000"],
        //24
        25: ["mplowrider_overlays", "LR_F_Hair_000"],
        26: ["mplowrider_overlays", "LR_F_Hair_001"],
        27: ["mplowrider_overlays", "LR_F_Hair_002"],
        29: ["mplowrider2_overlays", "LR_F_Hair_003"],
        30: ["mplowrider2_overlays", "LR_F_Hair_004"],
        31: ["mplowrider2_overlays", "LR_F_Hair_006"],
        32: ["mpbiker_overlays", "MP_Biker_Hair_000_F"],
        33: ["mpbiker_overlays", "MP_Biker_Hair_001_F"],
        34: ["mpbiker_overlays", "MP_Biker_Hair_002_F"],
        35: ["mpbiker_overlays", "MP_Biker_Hair_003_F"],
        38: ["mpbiker_overlays", "MP_Biker_Hair_004_F"],
        36: ["mpbiker_overlays", "MP_Biker_Hair_005_F"],
        37: ["mpbiker_overlays", "MP_Biker_Hair_005_F"],
        76: ["mpgunrunning_overlays", "MP_Gunrunning_Hair_F_000_F"],
        77: ["mpgunrunning_overlays", "MP_Gunrunning_Hair_F_001_F"],
        78: ["mpvinewood_overlays", "MP_Vinewood_Hair_F_000_F"],
        79: ["mptuner_overlays", "MP_Tuner_Hair_000_F"],
        80: ["mpsecurity_overlays", "MP_Security_Hair_000_F"],
    },
    Male: {
        0: ["", ""], // who doesn't like a shiny head from time to time?
        1: ["multiplayer_overlays", "FM_M_Hair_001_a"],
        2: ["multiplayer_overlays", "NG_M_Hair_002"],
        3: ["multiplayer_overlays", "FM_M_Hair_003_a"],
        4: ["multiplayer_overlays", "NG_M_Hair_004"],
        5: ["multiplayer_overlays", "FM_M_Hair_long_a"],
        6: ["multiplayer_overlays", "FM_M_Hair_006_a"],
        8: ["multiplayer_overlays", "FM_M_Hair_008_a"],
        9: ["multiplayer_overlays", "NG_M_Hair_009"],
        10: ["multiplayer_overlays", "NG_M_Hair_013"],
        11: ["multiplayer_overlays", "NG_M_Hair_002"],
        12: ["multiplayer_overlays", "NG_M_Hair_011"],
        13: ["multiplayer_overlays", "NG_M_Hair_012"],
        14: ["multiplayer_overlays", "NG_M_Hair_014"],
        15: ["multiplayer_overlays", "NG_M_Hair_015"],
        16: ["multiplayer_overlays", "NGBea_M_Hair_000"],
        17: ["multiplayer_overlays", "NGBea_M_Hair_001"],
        18: ["mpbusiness_overlays", "FM_Bus_M_Hair_000_a"],
        19: ["mpbusiness_overlays", "FM_Bus_M_Hair_001_a"],
        20: ["mphipster_overlays", "FM_Hip_M_Hair_000_a"],
        21: ["mphipster_overlays", "FM_Hip_M_Hair_001_a"],
        22: ["multiplayer_overlays", "NGInd_M_Hair_000"],
        //23
        24: ["mplowrider_overlays", "LR_M_Hair_000"],
        25: ["mplowrider_overlays", "LR_M_Hair_001"],
        26: ["mplowrider_overlays", "LR_M_Hair_002"],
        27: ["mplowrider_overlays", "LR_M_Hair_003"],
        28: ["mplowrider2_overlays", "LR_M_Hair_004"],
        29: ["mplowrider2_overlays", "LR_M_Hair_005"],
        30: ["mplowrider2_overlays", "LR_M_Hair_006"],
        31: ["mpbiker_overlays", "MP_Biker_Hair_000_M"],
        32: ["mpbiker_overlays", "MP_Biker_Hair_001_M"],
        33: ["mpbiker_overlays", "MP_Biker_Hair_002_M"],
        34: ["mpbiker_overlays", "MP_Biker_Hair_003_M"],
        35: ["mpbiker_overlays", "MP_Biker_Hair_004_M"],
        36: ["mpbiker_overlays", "MP_Biker_Hair_005_M"],
        72: ["mpgunrunning_overlays", "MP_Gunrunning_Hair_M_000_M"],
        73: ["mpgunrunning_overlays", "MP_Gunrunning_Hair_M_001_M"],
        74: ["mpvinewood_overlays", "MP_Vinewood_Hair_M_000_M"],
        75: ["mptuner_overlays", "MP_Tuner_Hair_001_M"],
        76: ["mpsecurity_overlays", "MP_Security_Hair_001_M"],
    }
});

export const HairBrowColours: ReadonlyArray<[number, number, number, number]> = Object.freeze([
    [28, 31, 33, 255],
    [39, 42, 44, 255],
    [49, 46, 44, 255],
    [53, 38, 28, 255],
    [75, 50, 31, 255],
    [92, 59, 36, 255],
    [109, 76, 53, 255],
    [107, 80, 59, 255],
    [118, 92, 69, 255],
    [127, 104, 78, 255],
    [153, 129, 93, 255],
    [167, 147, 105, 255],
    [175, 156, 112, 255],
    [187, 160, 99, 255],
    [214, 185, 123, 255],
    [218, 195, 142, 255],
    [159, 127, 89, 255],
    [132, 80, 57, 255],
    [104, 43, 31, 255],
    [97, 18, 12, 255],
    [100, 15, 10, 255],
    [124, 20, 15, 255],
    [160, 46, 25, 255],
    [182, 75, 40, 255],
    [162, 80, 47, 255],
    [170, 78, 43, 255],
    [98, 98, 98, 255]
]);

export const OldDLCHairMap = {
    // Beach Bum
    CLO_BBF_H_00: 'HAIR_GROUP_BCH1',
    CLO_BBF_H_05: 'HAIR_GROUP_BCH2',
    CLO_BBM_H_00: 'HAIR_GROUP_BCH3',
    CLO_BBM_H_05: 'HAIR_GROUP_BCH4',

    // Business
    CLO_BUS_H_0_0: 'HAIR_GROUP_BUS1',
    CLO_BUS_H_1_0: 'HAIR_GROUP_BUS2',
    CLO_BUS_F_H_0_0: 'HAIR_GROUP_BUS3',
    CLO_BUS_F_H_1_0: 'HAIR_GROUP_BUS4',

    // Valentines:
    CLO_VALF_H_0_0: 'HAIR_GROUP_VAL1',

    // Not A Hipster
    CLO_HP_F_HR_0_0: 'HAIR_GROUP_HIP3',
    CLO_HP_F_HR_1_0: 'HAIR_GROUP_HIP4',
    CLO_HP_HR_0_0: 'HAIR_GROUP_HIP1',
    CLO_HP_HR_1_0: 'HAIR_GROUP_HIP2',

    // Independence
    CLO_INDF_H_0_0: 'HAIR_GROUP_IND1',
    CLO_IND_H_0_0: 'HAIR_GROUP_IND1',
} as const;