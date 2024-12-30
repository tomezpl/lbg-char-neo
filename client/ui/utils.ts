import { Menu, NativeUI } from "./native-ui-wrapper";

/**
 * Adds Rotate Left/Right instructional buttons to a menu.
 * @param menu 
 */
export function addRotateButtonsToMenu(menu: Menu) {
    const rotateLeftLabel = 'INPUT_CREATOR_ROTATE_LEFT_DISPLAYONLY';
    const rotateRightLabel = 'INPUT_CREATOR_ROTATE_RIGHT_DISPLAYONLY';
    NativeUI.Menu.AddInstructionButton(menu, GetControlInstructionalButton(2, 205, true), GetLabelText(rotateLeftLabel));
    NativeUI.Menu.AddInstructionButton(menu, GetControlInstructionalButton(2, 206, true), GetLabelText(rotateRightLabel));
}