import { cameraShots } from 'constants/camera';
import { ChangeComponents, RefreshModel } from 'ped';
import { inputState, store } from 'state';
import { CharacterStore } from 'state/character-store';
import { ICameraState } from 'types/camera-state';
import { NativeUI, UIContext } from 'ui';
import { delay } from 'utils/delay';
import { loadAnim } from 'utils/load-anim';

export function animateCharCreatorIntro() {
    return playIntroAnim();
}

let cam2: number, cam3: number, camSkin: number;

let initPos: [number, number, number] = [0, 0, 0];

/**
 * Plays the character creator entrance animation on the player ped model and animates the camer.
 */
async function playIntroAnim() {
    // Disable gameplay controls.
    DisableAllControlActions(0);

    // Start a screen fade and disable the minimap.
    DoScreenFadeOut(1000);
    DisplayRadar(false);

    await delay(4000);

    // Reset cameras.
    DestroyAllCams(true);

    // Store the player's position before they were moved to the character creator interior.
    initPos = GetEntityCoords(PlayerPedId(), false) as [number, number, number];

    // Reset the ped to the currently saved character.
    RefreshModel();
    ChangeComponents();

    // Create the initial character creator camera (showing the full character)
    cam2 = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', cameraShots.body.x, cameraShots.body.y, cameraShots.body.z, 0.00, 0.00, 0.00, cameraShots.body.fov, false, 0);
    SetCamActive(cam2, true)
    RenderScriptCams(true, false, 2000, true, true)

    await delay(500);

    // Fade from black
    DoScreenFadeIn(2000)

    // So for whatever reason SetEntityCoords's typing expects a boolean but a boolean doesn't actually seem to work... so we do this terribleness
    const zero = 0.00 as unknown as boolean;

    inputState.setDisableMovement(true);

    // Position the player ped
    SetEntityCoords(PlayerPedId(), 405.59, -997.18, -99.00, zero, zero, zero, true);
    SetEntityHeading(PlayerPedId(), 90.00)

    await delay(500);

    // Interpolate to the idle camera
    cam3 = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', 402.99, -998.02, -99.00, 0.00, 0.00, 0.00, 50.00, false, 0);
    PointCamAtCoord(cam3, 402.99, -998.02, -99.00)
    SetCamActiveWithInterp(cam2, cam3, 5000, 1, 1)

    // Play the looped animation
    await loadAnim('mp_character_creation@customise@male_a');
    TaskPlayAnim(PlayerPedId(), 'mp_character_creation@customise@male_a', 'intro', 1.0, 1.0, 4050, 1, 1.0, false, false, false);

    await delay(5500);

    // Fix the player ped's location if needed.
    const targetCoords = [402.89, -996.87, -99.0] as const;
    const coords = GetEntityCoords(PlayerPedId(), false);
    if (GetDistanceBetweenCoords(coords[0], coords[1], coords[2], ...targetCoords, true) > 0.5) {
        SetEntityCoords(PlayerPedId(), ...targetCoords, zero, zero, zero, true);
        SetEntityHeading(PlayerPedId(), 173.97);
    }

    await delay(100);

    // Show the main menu.
    NativeUI.Menu.Visible(UIContext.creatorMainMenu, true);
    await delay(1000);

    // Freeze player ped in place.
    FreezeEntityPosition(PlayerPedId(), true);
}

export function animateCharCreatorOutro(doWalkAnim = true) {
    return playOutroAnim(doWalkAnim, store);
}

/**
 * Animates the screen fade, optionally playing the walk out animation on the player ped,
 * and teleports the player ped back to where they were when {@link playIntroAnim} was called.
 * @param doWalkAnim Should the player ped do the walking out animation?
 */
async function playOutroAnim(doWalkAnim: boolean, { character }: CharacterStore) {
    // Hide the menu
    NativeUI.Menu.Visible(UIContext.creatorMainMenu, false)

    // Unfreeze player ped
    FreezeEntityPosition(PlayerPedId(), false)

    // Play the outro animation.
    const animDict = ({ m: 'mp_character_creation@lineup@male_b', f: 'mp_character_creation@lineup@female_a' } as const)[character.ogd?.toLowerCase() || 'm'];
    if (doWalkAnim) {
        await loadAnim(animDict);
        TaskPlayAnim(PlayerPedId(), animDict, 'outro', 0.225, 1.0, 6000, 1, 1.0, false, false, false);
        await delay(4275);
    }

    // Fade to black
    DoScreenFadeOut(1000)
    await delay(1000);

    // Reset pos to what it was when the player went into the character creator screen
    SetEntityCoords(PlayerPedId(), initPos[0], initPos[1], initPos[2], true, false, false, true)

    // Reset cameras & HUD
    SetCamActive(camSkin, false)
    RenderScriptCams(false, false, 0, true, true)
    DisplayRadar(true)

    await delay(1000)

    // Apply saved clothing
    ChangeComponents()
    await delay(1000)

    // Re-enable gameplay controls.
    EnableAllControlActions(0)
    await delay(1000)

    // Fade from black.
    DoScreenFadeIn(1000)
    await delay(1000);

    // Reset input state.
    inputState.setDisableMovement(false);
}

/**
 * Toggles between active cameras
 * @param camera New camera state.
 */
export function createSkinCamera(camera: ICameraState) {
    if (camSkin) {
        const newCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', camera.x, camera.y, camera.z, 0.00, 0.00, 0.00, camera.fov, false, 0)
        PointCamAtCoord(newCam, camera.x, camera.y, camera.z)
        SetCamActiveWithInterp(newCam, camSkin, 250, 1, 1)
        camSkin = newCam
    } else {
        camSkin = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', camera.x, camera.y, camera.z, 0.00, 0.00, 0.00, camera.fov, false, 0)
        SetCamActive(cam2, true)
        RenderScriptCams(true, false, 2000, true, true)
    }
}