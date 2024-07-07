import { Character, DefaultCharacter } from "constants/character";

type CharacterStoreActions = {
    [Property in keyof Character as `set${Capitalize<Property & string>}`]: (value: Character[Property]) => void;
}

interface ICharacterStore {
    actions: CharacterStoreActions;
}

export class CharacterStore implements ICharacterStore {
    private _character : Character = JSON.parse(JSON.stringify(DefaultCharacter));
    public readonly actions: CharacterStoreActions;

    mdhash : number;

    public constructor() {
        this.actions = Object.fromEntries((Object.keys(DefaultCharacter) as Array<keyof Character>).map((prop) => {
            return [`set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}` as keyof CharacterStoreActions, (...[value]: Parameters<CharacterStoreActions[keyof CharacterStoreActions]>) => {
                this._character = {...(this._character), [prop]: value};
            }] as [keyof CharacterStoreActions, CharacterStoreActions[keyof CharacterStoreActions]];
        })) as CharacterStoreActions;
    }

    public get character() : Character {
        return this._character;
    }
}