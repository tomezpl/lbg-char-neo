import { MPFemale, MPMale } from 'constants/character';
import { RefreshModel } from 'ped';
import { CharacterStore } from 'state/character-store';
import { ComponentVariation } from 'constants/clothing';
import { OldDLCHairMap } from 'constants/hair';
import { clothingStore } from 'state/clothing-store';

export interface IVMenuCharacter {
    PedHeadBlendData: IVMenuPedHeadBlendData;
    IsMale: boolean;
    DrawableVariations: IVMenuPedDrawableVariations;
    PropVariations: IVMenuPedPropVariations;
    FaceShapeFeatures: IVMenuPedFaceShapeFeatures;
    PedAppearance: IVMenuPedAppearance;
    PedTatttoos: IVMenuPedTattoos;

    // vMenu doesn't seem to implement these
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    PedFacePaints: {};

    ModelHash: number;
    Version: number;
    WalkingStyle: string | null;
    FacialExpression: string | null;
    SaveName: string;
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
    const { actions } = store;

    // Character gender
    let mdHash = MPMale;
    if (character.IsMale == true) {
        actions.setGender('Male')
        actions.setOgd('M')
        actions.setLcgd('male')
    } else {
        actions.setGender('Female')
        actions.setOgd('F')
        actions.setLcgd('female')
        mdHash = MPFemale;
    }
    store.mdhash = GetHashKey(mdHash);

    //these fields come from PedHeadBlendData serialized in vMenu mp_ped_ KVP strings
    const headBlend = character.PedHeadBlendData
    const momID = headBlend.FirstFaceShape
    const dadID = headBlend.SecondFaceShape
    const shapeMix = headBlend.ParentFaceShapePercent
    const skinMix = headBlend.ParentSkinTonePercent
    actions.setMom(momID);
    actions.setDad(dadID);
    actions.setResemblance(shapeMix);
    actions.setSkintone(skinMix);

    // Get hairstyle names from the GXT files.
    const baseHaircutNames = Object.fromEntries((['f', 'm'] as const).map((gender) => {
        const pedName = `mp_${gender}_freemode_01` as const;
        return [gender, Object.entries(clothingStore[pedName].hair).reduce((hair, [hairIndex, hairNames], i) => {
            const label = `HAIR_GROUP_${gender.toUpperCase()}${i}`;

            let text: string;

            // There's like a random NVG headset in the middle of the hair styles that causes some of them to be offset by one...
            if (!(hairNames?.[0]?.label.length > 0) && Number(hairIndex) >= 16) {
                return hair;
            }
            if (DoesTextLabelExist(label)) {
                text = GetLabelText(label);
            } else if (hairNames?.[0] && hairNames[0]?.label in OldDLCHairMap && DoesTextLabelExist(OldDLCHairMap[hairNames?.[0]?.label as keyof typeof OldDLCHairMap])) {
                text = GetLabelText(OldDLCHairMap[hairNames?.[0]?.label as keyof typeof OldDLCHairMap]);
            } else if (DoesTextLabelExist(hairNames?.[0]?.label)) {
                text = GetLabelText(hairNames[0]?.label)
            }

            if (text) {
                const existingTextIndex = hair.findIndex(([existingText]) => existingText === text);
                if (existingTextIndex === -1) {
                    hair.push([text, [i]]);
                } else {
                    hair[existingTextIndex][1].push(i);
                }
            }

            return hair;
        }, [] as [string, number[]][])];
    }));
    const haircutNames = baseHaircutNames[character.IsMale ? 'm' : 'f'];

    //Copy vMenu PedAppearance
    const { PedAppearance: appearance } = character;

    // TODO: Hair highlights
    const hairIndex = haircutNames.findIndex(([, indices]) => indices.includes(appearance.hairStyle));
    actions.setHair(haircutNames[hairIndex][1][0]);
    actions.setHair_color_1(appearance.hairColor)

    actions.setMakeup_1(appearance.makeupStyle + 1);
    actions.setMakeup_3(appearance.makeupColor);
    actions.setMakeup_2(appearance.makeupOpacity);

    actions.setBlush_1(appearance.blushStyle + 1);
    actions.setBlush_3(appearance.blushColor)
    actions.setBlush_2(appearance.blushOpacity);

    actions.setLipstick_1(appearance.lipstickStyle + 1);
    actions.setLipstick_3(appearance.lipstickColor);
    actions.setLipstick_2(appearance.lipstickOpacity);

    actions.setEyebrows(appearance.eyebrowsStyle);
    actions.setEyebrows_2(appearance.eyebrowsOpacity);
    actions.setEyebrows_3(appearance.eyebrowsColor);

    actions.setAge_1(appearance.ageingStyle)
    actions.setAge_2(appearance.ageingOpacity)

    actions.setComplexion_1(appearance.complexionStyle);
    actions.setComplexion_2(appearance.complexionOpacity);

    actions.setBeard(appearance.beardStyle);
    actions.setBeard_2(appearance.beardOpacity);
    actions.setBeard_3(appearance.beardColor);

    actions.setMoles_1(appearance.molesFrecklesStyle);
    actions.setMoles_2(appearance.molesFrecklesOpacity);

    actions.setEye_color(appearance.eyeColor)

    //Copy vMenu FaceShapeFeatures
    const { features: faceShapeFeatures } = character.FaceShapeFeatures;

    actions.setNeck_thick(faceShapeFeatures['19'])
    actions.setChin_hole(faceShapeFeatures['18'])
    actions.setChin_width(faceShapeFeatures['17'])
    actions.setChin_length(faceShapeFeatures['16'])
    actions.setChin_height(faceShapeFeatures['15'])
    actions.setJaw_2(faceShapeFeatures['14'])
    actions.setJaw_1(faceShapeFeatures['13'])
    actions.setLips_thick(faceShapeFeatures['12'])
    actions.setEye_open(faceShapeFeatures['11'])
    actions.setCheeks_3(faceShapeFeatures['10'])
    actions.setCheeks_2(faceShapeFeatures['9'])
    actions.setCheeks_1(faceShapeFeatures['8'])
    actions.setEyebrows_6(faceShapeFeatures['6']);
    actions.setEyebrows_5(faceShapeFeatures['7'])
    actions.setNose_6(faceShapeFeatures['5'])
    actions.setNose_5(faceShapeFeatures['4'])
    actions.setNose_4(faceShapeFeatures['3'])
    actions.setNose_3(faceShapeFeatures['2'])
    actions.setNose_2(faceShapeFeatures['1'])
    actions.setNose_1(faceShapeFeatures['0'])

    // Setting the lbg outfit index to -1 as the character will have their own outfit.
    actions.setOutfit(-1);
    actions.setCustomOutfit(drawablesToTuples(character.DrawableVariations.clothes));
    actions.setCustomProps(drawablesToTuples(character.PropVariations.props));

    RefreshModel(true)
}

function drawablesToTuples(drawables: DrawableVariations): Record<number, ComponentVariation> {
    return Object.fromEntries(Object.entries(drawables).map(([componentId, drawable]) => {
        return [componentId, [drawable.Key, drawable.Value]]
    }))
}