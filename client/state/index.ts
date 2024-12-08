import { hidePeds } from 'utils/ped-hider';
import { CharacterStore } from './character-store';

export const store: CharacterStore = new CharacterStore();

let disableMovementTicker: number | null = null;

interface IInputState {
    readonly disableMovement: boolean;
    readonly inCreator: boolean;
    readonly isLeavingCreator: boolean;
    blockMenuButtons: boolean;
    setDisableMovement(disableMovement: boolean): void;
    setInCreator(inCreator: boolean): void;
    setLeavingCreator(leaving: boolean): void;
}

let hidePedsTick: ReturnType<typeof setTick> | null = null;

export const inputState: IInputState = {
    disableMovement: false,
    blockMenuButtons: false,
    isLeavingCreator: false,
    inCreator: false,
    setDisableMovement(disableMovement: boolean) {
        const thisState = this as IInputState;
        (thisState as { disableMovement: boolean }).disableMovement = disableMovement;

        if (thisState.disableMovement && typeof disableMovementTicker !== 'number') {
            disableMovementTicker = setTick(() => DisableAllControlActions(0));
        } else if (!thisState.disableMovement && typeof disableMovementTicker === 'number') {
            clearTick(disableMovementTicker);
            disableMovementTicker = null;
        }
    },

    setInCreator(inCreator) {
        if (hidePedsTick !== null) {
            clearTick(hidePedsTick);
            hidePedsTick = null;
        }

        if (inCreator) {
            hidePedsTick = setTick(() => {
                hidePeds();
            });
        }
    },

    setLeavingCreator(leaving) {
        const thisState = this as IInputState;

        (thisState as { isLeavingCreator: boolean }).isLeavingCreator = leaving;
    }
};