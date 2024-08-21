import { store } from 'state';
import { addMenuApparel } from './menus/apparel';
import { addMenuAppearance } from './menus/appearance';
import { addMenuFaceShape } from './menus/face-shape';
import { addMenuGender } from './menus/gender';
import { addMenuHeritage } from './menus/heritage';
import { Menu, MenuPool, NativeUI } from './native-ui-wrapper';
export * from './native-ui-wrapper';

export const UIContext = {
    menuPool: undefined as MenuPool,
    mainMenu: undefined as Menu,
};

export function addFinishButton(menuPool: MenuPool, parentMenu: Menu) {

    const finishButton = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Save & Continue", "Ready to play?", true, false);
    const sureButton = NativeUI.CreateItem("Are you sure?", "Press Enter to continue");
    NativeUI.Menu.AddItem(finishButton, sureButton);
    NativeUI.setEventListener(sureButton, "Activated", (menu, item) => {
        // EndCharCreator();
        NativeUI.Menu.Visible(finishButton, false);
        NativeUI.Menu.Visible(parentMenu, false);
    });
}

export function RunUI() {
    // const immediate = setImmediate(() => {
    let menuPool: MenuPool;
    let mainMenu: Menu;
    menuPool = NativeUI.CreatePool();
    mainMenu = NativeUI.CreateMenu("Character Creator", "~HUD_COLOUR_FREEMODE~EDIT CHARACTER", 47.5, 47.5);

    UIContext.mainMenu = mainMenu;
    UIContext.menuPool = menuPool;

    NativeUI.MenuPool.Add(menuPool, mainMenu);

    addMenuGender(mainMenu, store);
    addMenuHeritage(menuPool, mainMenu, store);
    addMenuFaceShape(menuPool, mainMenu, store);
    addMenuAppearance(menuPool, mainMenu, store);
    addMenuApparel(menuPool, mainMenu, store);
    addFinishButton(menuPool, mainMenu);

    setTick(() => {
        NativeUI.MenuPool.ProcessMenus(menuPool);
    });

    // if(immediate) {
    // clearImmediate(immediate);
    // }
    // });
}