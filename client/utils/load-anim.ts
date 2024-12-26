import { delay } from './delay';

export async function loadAnim(animDict: string) {
    const retries = 10;
    for (let i = 0; i < retries && !HasAnimDictLoaded(animDict); i++) {
        RequestAnimDict(animDict);
        await delay(250);
    }
}