import { animateCharCreatorIntro, animateCharCreatorOutro } from 'anim';
import { ActiveCharacterKvpName } from 'constants/misc';
import vMenuPlugin from 'plugins/vmenu';
import { inputState, store } from 'state';
import { addMenuApparel } from './menus/apparel';
import { addMenuAppearance } from './menus/appearance';
import { addMenuFaceShape } from './menus/face-shape';
import { addMenuGender } from './menus/gender';
import { addMenuHeritage } from './menus/heritage';
import { Menu, MenuPool, NativeUI } from './native-ui-wrapper';
export * from './native-ui-wrapper';

export const UIContext = {
    menuPool: undefined as MenuPool,
    creatorMainMenu: undefined as Menu,
    mainMenu: undefined as Menu,
};

export function addFinishButton(menuPool: MenuPool, parentMenu: Menu) {

    const finishButton = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Save & Continue", "Ready to play?", true, false);
    const sureButton = NativeUI.CreateItem("Are you sure?", "Press Enter to continue");
    NativeUI.Menu.AddItem(finishButton, sureButton);
    NativeUI.setEventListener(sureButton, "Activated", () => {
        if (!inputState.blockMenuButtons) {
            SetResourceKvp(ActiveCharacterKvpName, JSON.stringify(store.character));
            console.log('!!!! SAVING CHARACTER !!!!')
            animateCharCreatorOutro();
            NativeUI.Menu.Visible(finishButton, false);
            NativeUI.Menu.Visible(parentMenu, false);
        }
    });
}

export async function RunUI() {
    let menuPool: MenuPool;
    let mainMenu: Menu;
    let creatorMainMenu: Menu;
    menuPool = NativeUI.CreatePool();
    mainMenu = NativeUI.CreateMenu("Appearance", "~HUD_COLOUR_FREEMODE~EDIT CHARACTER", 47.5, 47.5);
    creatorMainMenu = NativeUI.MenuPool.AddSubMenu(menuPool, mainMenu, "Character Creator", "Create a GTA Online character.", true, false);

    NativeUI.setEventListener(mainMenu, 'OnMenuChanged', (parent, menu) => {
        if (menu === creatorMainMenu && !inputState.blockMenuButtons/* && Boolean(GetConvar("lbgchar_disableCreator", "false")) !== true*/) {
            const immediate = setImmediate(() => {
                NativeUI.Menu.Visible(creatorMainMenu, false);
                animateCharCreatorIntro().then(() => {
                    clearImmediate(immediate);
                });
            });
        }
    });

    UIContext.creatorMainMenu = creatorMainMenu;
    UIContext.mainMenu = mainMenu;
    UIContext.menuPool = menuPool;

    NativeUI.MenuPool.Add(menuPool, mainMenu);

    NativeUI.setEventListener(creatorMainMenu, 'OnMenuClosed', () => {
        NativeUI.Menu.Visible(mainMenu, false);
        inputState.blockMenuButtons = true;
        TriggerEvent('alertbox:message', 'alert', 'Are you sure you want to exit? Unsaved changes will be lost.', ['YES', 'BACK_ESC'], undefined, undefined, true, undefined, (_: never, outcome: 'YES' | 'BACK_ESC') => {
            if (outcome === 'YES') {
                animateCharCreatorOutro(false).then(() => {
                    inputState.blockMenuButtons = false;
                });
            } else {
                NativeUI.Menu.Visible(creatorMainMenu, true);
                inputState.blockMenuButtons = false;
            }
        });
    });

    addMenuGender(creatorMainMenu, store);
    addMenuHeritage(menuPool, creatorMainMenu, store);
    addMenuFaceShape(menuPool, creatorMainMenu, store);
    addMenuAppearance(menuPool, creatorMainMenu, store);
    await addMenuApparel(menuPool, creatorMainMenu, store);
    vMenuPlugin.ui.addvMenuCharacterList(menuPool, creatorMainMenu, store);
    vMenuPlugin.ui.addvMenuCharacterList(menuPool, mainMenu, store);
    addFinishButton(menuPool, creatorMainMenu);
}