import { ICameraState } from "types/camera-state";

const _cameraShots: Record<'face' | 'body', ICameraState> = {
    face: {
        x: 402.74,
        y: -1000.72,
        z: -98.45,
        fov: 10.00
    },

    body: {
        x: 402.92,
        y: -1000.72,
        z: -99.01,
        fov: 30.00
    },
};

export const cameraShots = Object.freeze(_cameraShots);