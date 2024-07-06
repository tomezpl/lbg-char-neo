export type Menu = unknown;

export type MenuPool = unknown;

interface MenuPoolGlobal  {
    Add(menuPool: MenuPool, menu: Menu): void;
    ProcessMenus(menuPool: MenuPool): void;
}

interface MenuGlobal {
    Visible(menu: Menu, visible: boolean): void;
}

interface INativeUIRoot {
    CreatePool() : MenuPool;
    CreateMenu(name: string, colour: string, width: number, height: number): Menu;
}

type INativeUI = INativeUIRoot & {
    Menu: MenuGlobal;
    MenuPool: MenuPoolGlobal;
};

type NativeUIKeys = keyof Omit<INativeUI, keyof INativeUIRoot>;
type NestedKeys<TKey extends NativeUIKeys = NativeUIKeys, TProp extends INativeUI[TKey] = INativeUI[TKey]> = `${TKey}:${Extract<keyof TProp, string>}`;

const ExportsKeys: Array<keyof INativeUIRoot | NestedKeys<'MenuPool'> | NestedKeys<'Menu'>> = [
    'CreatePool',
    'CreateMenu',
    'MenuPool:Add',
    'MenuPool:ProcessMenus',
    'Menu:Visible'
];

export const NativeUI: INativeUI = ExportsKeys.reduce((obj, key) => {
    const value = exports.NativeUI[key];
    console.log(key, typeof value);
    if(key.includes(':')) {
        const [className, funcName] = key.split(':');
        obj[className] ??= {} as unknown;
        (obj[className] as Record<any, unknown>)[funcName] = value;
        console.log(obj)
    } else {
        Object.assign(obj, {[key]: value});
    }

    return obj;
}, {} as Record<any, unknown>) as unknown as INativeUI;

