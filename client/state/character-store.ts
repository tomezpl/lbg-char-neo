import { Character, DefaultCharacter, MPMale } from "constants/character";
import { UIContext } from "ui";
import { addMenuAppearance } from "ui/menus/appearance";

type CharacterStoreActions = {
    [Property in keyof Character as `set${Capitalize<Property & string>}`]: (value: Character[Property]) => void;
}

interface ICharacterStore {
    actions: CharacterStoreActions;
}

export class CharacterStore implements ICharacterStore {
    private _character: Character = JSON.parse(JSON.stringify(DefaultCharacter));
    public readonly actions: CharacterStoreActions;

    mdhash: number;

    public constructor() {
        this.actions = Object.fromEntries((Object.keys(DefaultCharacter) as Array<keyof Character>).map((prop) => {
            return [`set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}` as keyof CharacterStoreActions, (...[value]: Parameters<CharacterStoreActions[keyof CharacterStoreActions]>) => {
                // this._character = {...(this._character), [prop]: value};
                this._character[prop as keyof Character] = value as Character[keyof Character];
            }] as [keyof CharacterStoreActions, CharacterStoreActions[keyof CharacterStoreActions]];
        })) as CharacterStoreActions;

        this.actions.setGender = (gender) => {
            this._character.gender = gender;

            // Reinitialise the appearance menu to update any gender-specific items
            addMenuAppearance(UIContext.menuPool, UIContext.creatorMainMenu, this);
        }

        this.mdhash = GetHashKey(MPMale);
    }

    public get character(): Character {
        return this._character;
    }
}