import { RunUI, NativeUI, UIContext } from "ui";

console.log("[lbg-char] Client Resource Started");

RunUI();

setTick(() => {

})

on('lbg-openChar', () => {
    setImmediate(() => {NativeUI["Menu:Visible"](UIContext.mainMenu, true);});
});

RegisterCommand("charedit", () => {
    emit("lbg-openChar");
}, false)