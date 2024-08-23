import { cameraShots } from "constants/camera";
import { Character } from "constants/character";
import { ChangeComponents, RefreshModel } from "ped";
import { inputState, store } from "state";
import { CharacterStore } from "state/character-store";
import { ICameraState } from "types/camera-state";
import { NativeUI, UIContext } from "ui";
import { delay } from "utils/delay";
import { loadAnim } from "utils/load-anim";

export function animateCharCreatorIntro() {
    return animateCameraIntro();
}

let cam: number, cam2: number, cam3: number, camSkin: number;

let initPos: [number, number, number] = [0, 0, 0];

async function animateCameraIntro() {
    DisableAllControlActions(0);
    DoScreenFadeOut(1000);
    DisplayRadar(false);
    await delay(4000);
    DestroyAllCams(true);
    initPos = GetEntityCoords(PlayerPedId(), false) as [number, number, number];
    RefreshModel()
    ChangeComponents(true)
    cam2 = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", cameraShots.body.x, cameraShots.body.y, cameraShots.body.z, 0.00, 0.00, 0.00, cameraShots.body.fov, false, 0);
    SetCamActive(cam2, true)
    RenderScriptCams(true, false, 2000, true, true)
    await delay(500);
    DoScreenFadeIn(2000)
    const zero = 0.00 as unknown as boolean;
    inputState.setDisableMovement(true);
    SetEntityCoords(PlayerPedId(), 405.59, -997.18, -99.00, zero, zero, zero, true);
    SetEntityHeading(PlayerPedId(), 90.00)
    await delay(500);
    cam3 = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", 402.99, -998.02, -99.00, 0.00, 0.00, 0.00, 50.00, false, 0);
    PointCamAtCoord(cam3, 402.99, -998.02, -99.00)
    SetCamActiveWithInterp(cam2, cam3, 5000, 1, 1)
    await loadAnim("mp_character_creation@customise@male_a");

    TaskPlayAnim(PlayerPedId(), "mp_character_creation@customise@male_a", "intro", 1.0, 1.0, 4050, 1, 1.0, false, false, false)
    await delay(5500);
    const targetCoords = [402.89, -996.87, -99.0] as const;
    const coords = GetEntityCoords(PlayerPedId(), false);
    if (GetDistanceBetweenCoords(coords[0], coords[1], coords[2], ...targetCoords, true) > 0.5) {
        SetEntityCoords(PlayerPedId(), ...targetCoords, zero, zero, zero, true);
        SetEntityHeading(PlayerPedId(), 173.97);
    }
    await delay(100);
    NativeUI.Menu.Visible(UIContext.creatorMainMenu, true);
    await delay(1000);
    FreezeEntityPosition(PlayerPedId(), true);
}

export function animateCharCreatorOutro(doWalkAnim = true) {
    return animateCameraOutro(doWalkAnim, store);
}

async function animateCameraOutro(doWalkAnim: boolean, { character }: CharacterStore) {
    NativeUI.Menu.Visible(UIContext.creatorMainMenu, false)
    FreezeEntityPosition(PlayerPedId(), false)
    const animDict = ({ m: "mp_character_creation@lineup@male_b", f: "mp_character_creation@lineup@female_a" } as const)[character.ogd?.toLowerCase() || 'm'];
    if (doWalkAnim) {
        await loadAnim(animDict);
        TaskPlayAnim(PlayerPedId(), animDict, "outro", 0.225, 1.0, 6000, 1, 1.0, false, false, false);
        await delay(4275);
    }
    DoScreenFadeOut(1000)
    await delay(1000);
    SetEntityCoords(PlayerPedId(), initPos[0], initPos[1], initPos[2], true, false, false, true)
    SetCamActive(camSkin, false)
    RenderScriptCams(false, false, 0, true, true)
    DisplayRadar(true)
    await delay(1000)
    ChangeComponents(false)
    DoScreenFadeOut(10)
    await delay(1000)
    SetCamActive(camSkin, false)
    RenderScriptCams(false, false, 0, true, true)
    EnableAllControlActions(0)
    FreezeEntityPosition(PlayerPedId(), false)
    await delay(1000)
    // TriggerServerEvent('lbg-chardone', Character)
    DisplayRadar(true)
    DoScreenFadeIn(1000)
    await delay(1000);
    inputState.setDisableMovement(false);
}

export function createSkinCamera(camera: ICameraState) {
    if (camSkin) {
        let newCam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", camera.x, camera.y, camera.z, 0.00, 0.00, 0.00, camera.fov, false, 0)
        PointCamAtCoord(newCam, camera.x, camera.y, camera.z)
        SetCamActiveWithInterp(newCam, camSkin, 250, 1, 1)
        camSkin = newCam
    } else {
        camSkin = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", camera.x, camera.y, camera.z, 0.00, 0.00, 0.00, camera.fov, false, 0)
        SetCamActive(cam2, true)
        RenderScriptCams(true, false, 2000, true, true)
    }
}