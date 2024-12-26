// These types don't actually match what's returned by Lua,
// they're just here to prevent passing wrong params to functions.
export type Menu = 'menu';
export type MenuPool = 'menuPool';
export type MenuItem = 'menuItem';
export type Panel = 'panel';
export type Window = 'window';
export type InstructionButton = 'instrButton';

interface MenuPoolGlobal {
    Add(menuPool: MenuPool, menu: Menu): void;
    ProcessMenus(menuPool: MenuPool): void;
    AddSubMenu(menuPool: MenuPool, parentMenu: Menu, text: string, description: string, keepPosition: boolean, keepBanner: boolean): Menu;
    MouseEdgeEnabled(menuPool: MenuPool, enabled: boolean): void;
}

interface MenuGlobal {
    Visible(menu: Menu, visible: boolean): void;
    AddItem(menu: Menu, item: MenuItem): void;
    AddWindow(menu: Menu, window: Window): void;
    Clear(menu: Menu): void;
    AddInstructionButton(menu: Menu, button: string, text: string): InstructionButton;
    CurrentSelection(menu: Menu): number;
}

interface MenuItemGlobal {
    Index(menuItem: MenuItem, index: number): void;
    Index(menuItem: MenuItem): number;
}

interface MenuListItemGlobal extends MenuItemGlobal {
    AddPanel(menuItem: MenuItem, panel: Panel): void;
    RemovePanelAt(menuItem: MenuItem, panelIndex: number): void;
    IndexToItem(menuItem: MenuItem, index: number): MenuItem;
    getPanelValue(panel: Panel): number | string;
    setPanelValue(panel: Panel, value: number): void;
    setPanelValue(panel: [Panel, Panel], value: [number, number]): void;
    setPanelEnabled(menuItem: MenuItem, panelIndex: number, enabled: boolean): void;
    getProp<TResult = unknown>(menuItem: MenuItem, propName: 'Panels' | 'Items'): TResult;
    setProp<TResult = unknown, TValue = unknown>(menuItem: MenuItem, propName: 'Panels' | 'Items', propValue: TValue): TResult;
    doesPanelExist(menuItem: MenuItem, panelIndex: number): boolean;
}

interface WindowGlobal {
    Index(window: Window, ...indices: ReadonlyArray<number>): void;
}

type NativeUIEvent =
    'OnListChange' |
    'OnListChanged' |
    'OnSliderChange' |
    'OnSliderChanged' |
    'OnMenuChanged' |
    'OnMenuClosed' |
    'Activated' |
    'OnItemSelect';

const defaultEventHandlers = {
    // Triggered on parent menu
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnListChange(sender: unknown, item: MenuItem, index: number) { },
    // Triggered on a menu list item
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnListChanged(parentMenu: never, item: MenuItem, index: number) { },

    // this one is usually registered on menus
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnSliderChange(sender: unknown, item: MenuItem, index: number) { },
    // this one is registered on menu items
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnSliderChanged(sender: unknown, item: MenuItem, index: number) { },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnMenuChanged(parent: Menu, menu: Menu) { },
    OnMenuClosed() { },
    Activated() { },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    OnItemSelect(sender: never, item: never, index: number) { }
} as const;

type NativeUIEventHandler<TEvent extends NativeUIEvent> = (...params: Parameters<typeof defaultEventHandlers[TEvent]>) => ReturnType<typeof defaultEventHandlers[TEvent]>;

interface INativeUIRoot {
    CreatePool(): MenuPool;
    CreateMenu(name: string, colour: string, width: number, height: number): Menu;
    CreateItem(text: string, description: string): MenuItem;
    CreateListItem(name: string, options: ReadonlyArray<string>, defaultItemIndex: number, description: string): MenuItem;
    CreateHeritageWindow(defaultMum: number | `-${number}`, defaultDad: number | `-${number}`): Window;
    CreateSliderItem(name: string, levels: ReadonlyArray<number | string>, defaultLevelIndex: number, description: string, divider: boolean): MenuItem;
    CreateColourPanel(name: string, colours: ReadonlyArray<[number, number, number, number]>): Panel;
    CreatePercentagePanel(minText: string, title: string, maxText: string): Panel;
    setEventListener<TEvent extends NativeUIEvent = NativeUIEvent>(target: Menu | MenuItem, event: TEvent, handler: NativeUIEventHandler<TEvent>): void;
}

type INativeUI = INativeUIRoot & {
    Menu: MenuGlobal;
    MenuPool: MenuPoolGlobal;
    MenuItem: MenuItemGlobal;
    MenuListItem: MenuListItemGlobal;
    Window: WindowGlobal;
};

type NativeUIKeys = keyof Omit<INativeUI, keyof INativeUIRoot>;
type NestedKeys<TKey extends NativeUIKeys = NativeUIKeys, TProp extends INativeUI[TKey] = INativeUI[TKey]> = `${TKey}:${Extract<keyof TProp, string>}`;

type AllNestedKeys =
    NestedKeys<'MenuPool'> |
    NestedKeys<'Menu'> |
    NestedKeys<'MenuItem'> |
    NestedKeys<'MenuListItem'> |
    NestedKeys<'Window'>;

// This is a Record rather than an array so we get type errors if we forgot to declare a field here.
const exportsKeys: Record<keyof Omit<INativeUIRoot, 'setEventListener'> | AllNestedKeys, 1> = {
    'CreatePool': 1,
    'CreateMenu': 1,
    'MenuPool:Add': 1,
    'MenuPool:ProcessMenus': 1,
    'Menu:Visible': 1,
    'Menu:AddItem': 1,
    'CreateItem': 1,
    'CreateListItem': 1,
    'MenuPool:AddSubMenu': 1,
    'Menu:AddWindow': 1,
    'CreateHeritageWindow': 1,
    'Window:Index': 1,
    'CreateSliderItem': 1,
    'MenuItem:Index': 1,
    'CreateColourPanel': 1,
    'MenuListItem:AddPanel': 1,
    'MenuListItem:Index': 1,
    'MenuListItem:IndexToItem': 1,
    'MenuListItem:getProp': 1,
    'MenuListItem:getPanelValue': 1,
    'MenuListItem:setPanelValue': 1,
    'MenuListItem:setPanelEnabled': 1,
    'MenuListItem:setProp': 1,
    'CreatePercentagePanel': 1,
    'MenuListItem:RemovePanelAt': 1,
    'MenuListItem:doesPanelExist': 1,
    'Menu:Clear': 1,
    'Menu:AddInstructionButton': 1,
    'Menu:CurrentSelection': 1,
    'MenuPool:MouseEdgeEnabled': 1
};

type EventTarget = Menu | MenuItem;

type EventName = `nativeuilua:js:${EventTarget}${number}:${NativeUIEvent}`;

const eventCount: Partial<Record<EventName, number>> = {

};

/**
 * A wrapper for the NativeUILua resource.
 * 
 * If you want to access a new export, you need to add it to {@link exportsKeys} as a `className:funcName` string.
 */
export const NativeUI: INativeUI = Object.keys(exportsKeys).reduce((obj, key) => {
    const value = exports.NativeUI[key];

    // Populate the object with functions exported by NativeUILua. Only the functions included in exportsKeys will be populated.
    if (key.includes(':')) {
        const [className, funcName] = key.split(':');
        if (!(className in obj)) {
            Object.assign(obj, { [className]: {} });
        }
        Object.assign(obj[className as keyof typeof obj], { [funcName]: value });
    } else {
        Object.assign(obj, { [key]: value });
    }

    return obj;
}, {
    setEventListener(target, event, handler) {
        const baseEventName = `nativeuilua:js:${target as `${EventTarget}${number}`}:${event}` as const;
        let count = eventCount[baseEventName] || 0;
        count++;
        const eventName = `${baseEventName}${count}`;
        on(eventName, handler);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        exports.NativeUI._setEventListener(target, event, eventName);
        eventCount[baseEventName] = count;
    }
} as Partial<INativeUI>) as unknown as INativeUI;

