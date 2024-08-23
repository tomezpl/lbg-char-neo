import { CharacterStore } from "./character-store";

export const store: CharacterStore = new CharacterStore();

let disableMovementTicker: number | null = null;

interface IInputState {
    readonly disableMovement: boolean;
    blockMenuButtons: boolean;
    setDisableMovement(disableMovement: boolean): void;
}

export const inputState: IInputState = {
    disableMovement: false,
    blockMenuButtons: false,
    setDisableMovement(disableMovement: boolean) {
        this.disableMovement = disableMovement;

        if (this.disableMovement && typeof disableMovementTicker !== 'number') {
            disableMovementTicker = setTick(() => DisableAllControlActions(0));
        } else if (!this.disableMovement && typeof disableMovementTicker === 'number') {
            clearTick(disableMovementTicker);
            disableMovementTicker = null;
        }
    }
};