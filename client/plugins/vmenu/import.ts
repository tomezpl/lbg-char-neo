import type { IVMenuCharacter } from './ped';

/**
 * Loads vMenu characters.
 * @returns An object where each key is a vMenu character's name and the value is a matching {@link IVMenuCharacter}
 */
export function getVMenuCharacters() {
    const mpChars: Record<string, IVMenuCharacter> = {};
    const mpCharHandle = StartFindExternalKvp('vMenu', 'mp_ped_');

    if (mpCharHandle !== -1) {
        for (let key = FindKvp(mpCharHandle); key?.length > 0; key = FindKvp(mpCharHandle)) {
            const charJson = GetExternalKvpString('vMenu', key);
            const charParsed = JSON.parse(charJson) as IVMenuCharacter;
            // Extract the character name from the save name.
            const charName = charParsed.SaveName.slice('mp_ped_'.length);
            // console.log(charName);
            // console.log(charJson);
            mpChars[charName] = charParsed;
        }
    }

    EndFindKvp(mpCharHandle)

    return mpChars;

}