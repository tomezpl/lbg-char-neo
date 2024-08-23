import { RefreshModel } from "ped";
import { CharacterStore } from "state/character-store";

export interface IVMenuCharacter {
    PedHeadBlendData: IVMenuPedHeadBlendData;
    IsMale: boolean;
    DrawableVariations: IVMenuPedDrawableVariations;
    PropVariations: IVMenuPedPropVariations;
    FaceShapeFeatures: IVMenuPedFaceShapeFeatures;
    PedAppearance: IVMenuPedAppearance;
    PedTatttoos: IVMenuPedTattoos;

    // vMenu doesn't seem to implement these
    PedFacePaints: {};

    ModelHash: number;
    Version: number;
    WalkingStyle: string | null;
    FacialExpression: string | null;
}

interface IVMenuPedHeadBlendData {
    FirstFaceShape: number;
    SecondFaceShape: number;
    ThirdFaceShape: number;
    ParentFaceShapePercent: number;
    ParentSkinTonePercent: number;
    ParentThirdUnkPercent: number;
    IsParentInheritance: boolean;
}

type Drawable<T extends string | number = number> = { Key: T, Value: T };
type DrawableVariations = Record<`${number}`, Drawable<number>>;
type PropVariations = DrawableVariations;

interface IVMenuPedDrawableVariations {
    clothes: DrawableVariations;
}

interface IVMenuPedAppearance {
    hairStyle: number;
    hairColor: number;
    hairHighlightColor: number;
    HairOverlay: Drawable<string>;
    blemishesStyle: number;
    blemishesOpacity: number;
    beardStyle: number;
    beardColor: number;
    beardOpacity: number;
    eyebrowsStyle: number;
    eyebrowsColor: number;
    eyebrowsOpacity: number;
    ageingStyle: number;
    ageingOpacity: number;
    makeupStyle: number;
    makeupColor: number;
    makeupOpacity: number;
    blushStyle: number;
    blushColor: number;
    blushOpacity: number;
    complexionStyle: number;
    complexionOpacity: number;
    sunDamageStyle: number;
    sunDamageOpacity: number;
    lipstickStyle: number;
    lipstickColor: number;
    lipstickOpacity: number;
    molesFrecklesStyle: number;
    molesFrecklesOpacity: number;
    bodyBlemishesStyle: number;
    bodyBlemishesOpacity: number;
    eyeColor: number;
}

interface IVMenuPedPropVariations {
    props: PropVariations;
}

interface IVMenuPedFaceShapeFeatures {
    features: Record<`${number}`, number>;
}

type Tattoo = { Key: string; Value: string };

interface IVMenuPedTattoos {
    TorsoTattoos: ReadonlyArray<Tattoo>;
    HeadTattoos: ReadonlyArray<Tattoo>;
    BadgeTattoos: ReadonlyArray<Tattoo>;
    LeftArmTattoos: ReadonlyArray<Tattoo>;
    LeftLegTattoos: ReadonlyArray<Tattoo>;
    RightArmTattoos: ReadonlyArray<Tattoo>;
    RightLegTattoos: ReadonlyArray<Tattoo>;
}

export function applyVMenuCharacter(character: IVMenuCharacter, store: CharacterStore) {
    // TODO: this function needs to also update the ui state

    const { actions } = store;

    // Character gender
    let mdHash = "mp_m_freemode_01"
    if (character.IsMale == true) {
        actions.setGender("Male")
        actions.setOgd("M")
        actions.setLcgd("male")
    } else {
        actions.setGender("Female")
        actions.setOgd("F")
        actions.setLcgd("f")
        mdHash = "mp_f_freemode_01";
    }
    store.mdhash = GetHashKey(mdHash);

    //these fields come from PedHeadBlendData serialized in vMenu mp_ped_ KVP strings
    let headBlend = character.PedHeadBlendData
    let momID = headBlend.FirstFaceShape
    let dadID = headBlend.SecondFaceShape
    let shapeMix = headBlend.ParentFaceShapePercent
    let skinMix = headBlend.ParentSkinTonePercent
    actions.setMom(momID);
    actions.setDad(dadID);
    actions.setResemblance(shapeMix);
    actions.setSkintone(skinMix);

    //Copy vMenu PedAppearance
    let appearance = character.PedAppearance;
    actions.setHair(appearance.hairStyle);
    actions.setHair_color_1(appearance.hairColor);
    //TODO: hair highlights colour ?

    actions.setEyebrows(appearance.eyebrowsStyle);
    actions.setEyebrows_2(appearance.eyebrowsOpacity);
    actions.setEyebrows_3(appearance.eyebrowsColor);

    actions.setAge_1(appearance.ageingStyle)
    actions.setAge_2(appearance.ageingOpacity)

    actions.setComplexion_1(appearance.complexionStyle);
    actions.setComplexion_2(appearance.complexionOpacity);

    actions.setMakeup_1(appearance.makeupStyle);
    actions.setMakeup_2(appearance.makeupOpacity);
    actions.setMakeup_3(appearance.makeupColor);

    actions.setLipstick_1(appearance.lipstickStyle);
    actions.setLipstick_2(appearance.lipstickOpacity);
    actions.setLipstick_3(appearance.lipstickColor);

    actions.setBlush_1(appearance.blushStyle);
    actions.setBlush_2(appearance.blushOpacity);
    actions.setBlush_3(appearance.blushColor);

    actions.setBeard(appearance.beardStyle);
    actions.setBeard_2(appearance.beardOpacity);
    actions.setBeard_3(appearance.beardColor);


    actions.setMoles_1(appearance.molesFrecklesStyle);
    actions.setMoles_2(appearance.molesFrecklesOpacity);

    actions.setEye_color(appearance.eyeColor)

    //Copy vMenu FaceShapeFeatures
    const { features: faceShapeFeatures } = character.FaceShapeFeatures;

    actions.setNeck_thick(faceShapeFeatures["19"])
    actions.setChin_hole(faceShapeFeatures["18"])
    actions.setChin_width(faceShapeFeatures["17"])
    actions.setChin_length(faceShapeFeatures["16"])
    actions.setChin_height(faceShapeFeatures["15"])
    actions.setJaw_2(faceShapeFeatures["14"])
    actions.setJaw_1(faceShapeFeatures["13"])
    actions.setLips_thick(faceShapeFeatures["12"])
    actions.setEye_open(faceShapeFeatures["11"])
    actions.setCheeks_3(faceShapeFeatures["10"])
    actions.setCheeks_2(faceShapeFeatures["9"])
    actions.setCheeks_1(faceShapeFeatures["8"])
    actions.setEyebrows_6(faceShapeFeatures["6"]);
    actions.setEyebrows_5(faceShapeFeatures["7"])
    actions.setNose_6(faceShapeFeatures["5"])
    actions.setNose_5(faceShapeFeatures["4"])
    actions.setNose_4(faceShapeFeatures["3"])
    actions.setNose_3(faceShapeFeatures["2"])
    actions.setNose_2(faceShapeFeatures["1"])
    actions.setNose_1(faceShapeFeatures["0"])

    //Set default outfit
    //TODO: add vMenu clothing
    actions.setOutfit(0);

    RefreshModel(true)
}