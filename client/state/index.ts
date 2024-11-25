import { CharacterStore } from './character-store';

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
        const thisState = this as IInputState;
        (thisState as { disableMovement: boolean }).disableMovement = disableMovement;

        if (thisState.disableMovement && typeof disableMovementTicker !== 'number') {
            disableMovementTicker = setTick(() => DisableAllControlActions(0));
        } else if (!thisState.disableMovement && typeof disableMovementTicker === 'number') {
            clearTick(disableMovementTicker);
            disableMovementTicker = null;
        }
    }
};