type Menu = unknown;

type MenuPool = unknown;

interface MenuPoolGlobal  {
    Add(menuPool: MenuPool, menu: Menu): void;
    ProcessMenus(menuPool: MenuPool): void;
}

interface MenuGlobal {
    Visible(menu: Menu, visible: boolean): void;
}

interface INativeUI {
    CreatePool() : MenuPool;
    CreateMenu(name: string, colour: string, width: number, height: number): Menu;
    MenuPool: MenuPoolGlobal;
    Menu: MenuGlobal;
    [k: string]: any;
    "Menu:Visible": MenuGlobal["Visible"];
};

export const NativeUI: INativeUI = exports.NativeUI as unknown as INativeUI;

export const UIContext = {
    menuPool: undefined as MenuPool,
    mainMenu: undefined as Menu,
};

export function RunUI() {
    // const immediate = setImmediate(() => {
        let menuPool: MenuPool;
        let mainMenu: Menu;
        menuPool = NativeUI.CreatePool();
        mainMenu = NativeUI.CreateMenu("Character Creator", "~HUD_COLOUR_FREEMODE~EDIT CHARACTER", 47.5, 47.5);

        UIContext.mainMenu = mainMenu;
        UIContext.menuPool = menuPool;

        (NativeUI["MenuPool.Add"] as MenuPoolGlobal["Add"])(menuPool, mainMenu);
        setTick(() =>  {
            const NativeUI: INativeUI = exports.NativeUI as unknown as INativeUI;
            (NativeUI["MenuPool:ProcessMenus"] as MenuPoolGlobal["ProcessMenus"])(menuPool);
        });

        // if(immediate) {
            // clearImmediate(immediate);
        // }
    // });
}