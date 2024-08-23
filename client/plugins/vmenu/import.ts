import type { IVMenuCharacter } from "./ped";

export function getVMenuCharacters() {
    const mpChars: Record<string, IVMenuCharacter> = {};
    const mpCharHandle = StartFindExternalKvp("vMenu", "mp_ped_");

    if (mpCharHandle !== -1) {
        for (let key = FindKvp(mpCharHandle); key?.length > 0; key = FindKvp(mpCharHandle)) {
            const charJson = GetExternalKvpString("vMenu", key);
            const charParsed = JSON.parse(charJson);
            const charName = charParsed.SaveName.slice('mp_ped_'.length);
            // console.log(charName);
            // console.log(charJson);
            mpChars[charName] = charParsed;
        }
    }

    EndFindKvp(mpCharHandle)

    return mpChars;

}