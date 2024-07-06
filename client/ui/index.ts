import {Menu, MenuPool, NativeUI} from './native-ui-wrapper';
export * from './native-ui-wrapper';

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

        NativeUI.MenuPool.Add(menuPool, mainMenu);
        setTick(() =>  {
            NativeUI.MenuPool.ProcessMenus(menuPool);
        });

        // if(immediate) {
            // clearImmediate(immediate);
        // }
    // });
}