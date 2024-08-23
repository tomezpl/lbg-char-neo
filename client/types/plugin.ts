export type IPlugin<TPedPlugin extends {} = {}, TUIPlugin extends {} = {}, TDataPlugin extends {} = {}> = {
    ped?: TPedPlugin;
    ui?: TUIPlugin;
    data?: TDataPlugin;
}