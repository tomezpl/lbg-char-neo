import { Character, DefaultCharacter } from "constants/character";

export class CharacterStore {
    private _character : Character = JSON.parse(JSON.stringify(DefaultCharacter));

    mdhash : number;

    public get character() : Character {
        return this._character;
    }
}