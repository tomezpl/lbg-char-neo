// These types don't actually match what's returned by Lua,
// they're just here to prevent passing wrong params to functions.
export type Menu = 'menu';
export type MenuPool = 'menuPool';
export type MenuItem = 'menuItem';

interface MenuPoolGlobal  {
    Add(menuPool: MenuPool, menu: Menu): void;
    ProcessMenus(menuPool: MenuPool): void;
}

interface MenuGlobal {
    Visible(menu: Menu, visible: boolean): void;
    AddItem(menu: Menu, item: MenuItem): void;
}

const NativeUIEvents = [
    'OnListChange',
] as const;

type NativeUIEvent = typeof NativeUIEvents[number];

const defaultEventHandlers = {
    OnListChange(sender: unknown, item: unknown, index: number) {},
} as const;

type NativeUIEventHandler<TEvent extends NativeUIEvent> = (...params: Parameters<typeof defaultEventHandlers[TEvent]>) => ReturnType<typeof defaultEventHandlers[TEvent]>;

interface INativeUIRoot {
    CreatePool() : MenuPool;
    CreateMenu(name: string, colour: string, width: number, height: number): Menu;
    CreateListItem(name: string, options: ReadonlyArray<string>, defaultItemIndex: number, description: string): MenuItem;
    setEventListener(target: Menu | MenuItem, event: NativeUIEvent, handler: NativeUIEventHandler<NativeUIEvent>): void;
}

type INativeUI = INativeUIRoot & {
    Menu: MenuGlobal;
    MenuPool: MenuPoolGlobal;
};

type NativeUIKeys = keyof Omit<INativeUI, keyof INativeUIRoot>;
type NestedKeys<TKey extends NativeUIKeys = NativeUIKeys, TProp extends INativeUI[TKey] = INativeUI[TKey]> = `${TKey}:${Extract<keyof TProp, string>}`;

// This is a Record rather than an array so we get type errors if we forgot to declare a field here.
const exportsKeys: Record<keyof Omit<INativeUIRoot, 'setEventListener'> | NestedKeys<'MenuPool'> | NestedKeys<'Menu'>, 1> = {
    'CreatePool': 1,
    'CreateMenu': 1,
    'MenuPool:Add': 1,
    'MenuPool:ProcessMenus': 1,
    'Menu:Visible': 1,
    "Menu:AddItem": 1,
    'CreateListItem': 1,
};

export const NativeUI: INativeUI = Object.keys(exportsKeys).reduce((obj, key) => {
    const value = exports.NativeUI[key];
    console.log(key, typeof value);
    if(key.includes(':')) {
        const [className, funcName] = key.split(':');
        (obj[className as keyof typeof obj] as unknown as Record<any, unknown>) ??= {};
        (obj[className as keyof typeof obj] as unknown as Record<any, unknown>)[funcName] = value;
        console.log(obj)
    } else {
        Object.assign(obj, {[key]: value});
    }

    return obj;
}, {
    setEventListener(target, event, handler) {
        const eventName = `nativeuilua:js:${target}:${event}` as const;
        on(eventName, handler);
        exports.NativeUI._setEventListener(target, event, eventName);
    }
} as Partial<INativeUI>) as unknown as INativeUI;

