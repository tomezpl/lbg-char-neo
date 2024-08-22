import { animateCharCreatorIntro } from "anim";
import { RunUI, NativeUI, UIContext } from "ui";

console.log("[lbg-char] Client Resource Started");

RunUI();

on('lbg-openChar', () => {
    setImmediate(() => {
        animateCharCreatorIntro();
    });
});

RegisterCommand("charedit", () => {
    emit("lbg-openChar");
}, false);