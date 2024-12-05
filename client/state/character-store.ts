import { Character, DefaultCharacter, MPFemale, MPMale, SavedCharacterSlotPrefix } from 'constants/character';

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
    private _character: Character = JSON.parse(JSON.stringify(DefaultCharacter)) as Character;
    private _savedCharacters: Record<number, SavedCharacter> = {};
    public readonly currentSavedCharacter: number = -1;

    public readonly actions: CharacterStoreActions;

    mdhash: number;

    public constructor() {
        // Autogenerate setter actions for most properties.
        this.actions = Object.fromEntries((Object.keys(DefaultCharacter) as Array<keyof Character>).map((prop: keyof Character) => {
            return [`set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}` as keyof CharacterStoreActions, (...[value]: Parameters<CharacterStoreActions[keyof CharacterStoreActions]>) => {
                const newValue: unknown = (typeof value !== 'undefined' ? value : 0);
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
                this._character = JSON.parse(JSON.stringify(this._savedCharacters[slotIndex].character)) as Character;
                this.mdhash = this._character.ogd.toLowerCase() === 'm' ? GetHashKey(MPMale) : GetHashKey(MPFemale);
                (this as { currentSavedCharacter: number }).currentSavedCharacter = slotIndex;
            }
        };

        this.mdhash = GetHashKey(MPMale);

        // Load saved characters.
        restoreSavedCharacters(this);
    }

    public get character(): Character {
        return this._character;
    }
}

/**
 * Populates saved character slots in {@link store}
 * 
 * @param store Store to populate saved character data in.
 */
export function restoreSavedCharacters(store: CharacterStore) {
    const prefix = SavedCharacterSlotPrefix;
    const kvpHandle = StartFindKvp(prefix);
    let savedCharKey: string | undefined;
    do {
        savedCharKey = FindKvp(kvpHandle);
        if (savedCharKey) {
            const characterJson = GetResourceKvpString(savedCharKey);
            const parsedChar: SavedCharacter = JSON.parse(characterJson) as SavedCharacter;
            const index = Number(savedCharKey.replace(prefix, ''));
            if (Number.isInteger(index) && !Number.isNaN(index) && ['m', 'f'].includes(parsedChar?.character?.ogd?.toLowerCase())) {
                (store as unknown as { _savedCharacters: Record<number, SavedCharacter> })._savedCharacters[index] = parsedChar;
            }
        }
    } while (savedCharKey)
    EndFindKvp(kvpHandle);
}