import { Character, DefaultCharacter, MPMale, SavedCharacterSlotPrefix } from "constants/character";
import { store } from "state";
import { UIContext } from "ui";
import { addMenuAppearance } from "ui/menus/appearance";

type ExtractPrimitiveType<T> = T extends number ? number : T;

type CharacterStoreSetters = {
    [Property in keyof Character as `set${Capitalize<Property & string>}`]: (value: ExtractPrimitiveType<Character[Property]>) => void;
}

export type CharacterStoreActions = CharacterStoreSetters & {
    setSavedCharacter: (slotIndex: number) => void;
}

interface ICharacterStore {
    actions: CharacterStoreActions;
}

export type SavedCharacter = {
    character: Character;
    slotName: string;
}

export class CharacterStore implements ICharacterStore {
    private _character: Character = JSON.parse(JSON.stringify(DefaultCharacter));
    private _savedCharacters: Record<number, SavedCharacter> = {};
    public readonly currentSavedCharacter: number = -1;

    public readonly actions: CharacterStoreActions;

    mdhash: number;

    public constructor() {
        this.actions = Object.fromEntries((Object.keys(DefaultCharacter) as Array<keyof Character>).map((prop: keyof Character) => {
            return [`set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}` as keyof CharacterStoreActions, (...[value]: Parameters<CharacterStoreActions[keyof CharacterStoreActions]>) => {
                const newValue = (typeof value !== 'undefined' ? value : 0) as Character[typeof prop];
                Object.assign(this._character, { [prop]: newValue });
            }] as [keyof CharacterStoreActions, CharacterStoreActions[keyof CharacterStoreActions]];
        })) as CharacterStoreActions;

        this.actions.setGender = (gender) => {
            this._character.gender = gender;

            // Reinitialise the appearance menu to update any gender-specific items
            // addMenuAppearance(UIContext.menuPool, UIContext.creatorMainMenu, this);
        }

        this.actions.setSavedCharacter = (slotIndex) => {
            if (slotIndex in this._savedCharacters) {
                this._character = JSON.parse(JSON.stringify(this._savedCharacters[slotIndex].character));
                (this as { currentSavedCharacter: number }).currentSavedCharacter = slotIndex;
            }
        };

        this.mdhash = GetHashKey(MPMale);
    }

    public get character(): Character {
        return this._character;
    }
}

export function restoreSavedCharacters() {
    const prefix = SavedCharacterSlotPrefix;
    const kvpHandle = StartFindKvp(prefix);
    let savedCharKey: string | undefined;
    do {
        savedCharKey = FindKvp(kvpHandle);
        if (savedCharKey) {
            const characterJson = GetResourceKvpString(savedCharKey);
            const parsedChar: SavedCharacter = JSON.parse(characterJson);
            const index = Number(savedCharKey.replace(prefix, ''));
            if (Number.isInteger(index) && !Number.isNaN(index) && ['m', 'f'].includes(parsedChar?.character?.ogd?.toLowerCase())) {
                (store as unknown as { _savedCharacters: Record<number, SavedCharacter> })._savedCharacters[index] = parsedChar;
            }
        }
    } while (savedCharKey)
    EndFindKvp(kvpHandle);
}