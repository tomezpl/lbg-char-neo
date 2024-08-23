import { animateCharCreatorIntro } from "anim";
import { RunUI, NativeUI, UIContext } from "ui";

console.log("[lbg-char] Client Resource Started");

RunUI();

on('lbg-openChar', () => {
    NativeUI.Menu.Visible(UIContext.mainMenu, true);
});

RegisterCommand("charedit", () => {
    emit("lbg-openChar");
}, false);