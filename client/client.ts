import { animateCharCreatorIntro } from "anim";
import { Character, MPFemale, MPMale } from "constants/character";
import { PedComponents } from "constants/clothing";
import { ActiveCharacterKvpName } from "constants/misc";
import { RefreshModel } from "ped";
import { store } from "state";
import { RunUI, NativeUI, UIContext } from "ui";

console.log("[lbg-char] Client Resource Started");

function RestoreSavedCharacter() {
    const activeCharacterJson = GetResourceKvpString(ActiveCharacterKvpName);
    if (typeof activeCharacterJson === 'string' && activeCharacterJson[0] === '{') {
        console.log(activeCharacterJson);
        const parsed = JSON.parse(activeCharacterJson) as unknown as Character;
        Object.entries(parsed).forEach(([prop, value]: [keyof Character, Character[keyof Character]]) => {
            store.actions[`set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}` as keyof typeof store['actions']](value);
        });

        store.mdhash = GetHashKey([MPFemale, MPMale][+((parsed.ogd?.toLowerCase()[0] || 'm') !== 'f')]);
    }
}

RestoreSavedCharacter();
RunUI();

on('lbg-openChar', () => {
    NativeUI.Menu.Visible(UIContext.mainMenu, true);
});

RegisterCommand("charedit", () => {
    emit("lbg-openChar");
}, false);

RegisterCommand("die", () => {
    SetEntityHealth(PlayerPedId(), 0);
}, false);

on('playerSpawned', () => {
    RefreshModel(true, store.character);
})

const hashName = GetHashNameForComponent(PlayerPedId(), PedComponents.torso, 452, 0);
console.log(`fivem hash for jbib drawable id 452: ${hashName.toString(16)}`);
const [fivemNameHash, fivemEnumType, fivemComponentType] = GetVariantComponent(hashName, 0);
console.log(`variant name hash: 0x${fivemNameHash.toString(16)}, enum type ${fivemEnumType}, comp type ${fivemComponentType}`)
console.log(`0x${GetHashKey('DLC_MP_HEIST_F_SPECIAL2_0_0').toString(16)}`);