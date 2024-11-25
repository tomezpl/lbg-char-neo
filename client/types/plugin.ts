// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type IPlugin<TPedPlugin extends {} = {}, TUIPlugin extends {} = {}, TDataPlugin extends {} = {}> = {
    ped?: TPedPlugin;
    ui?: TUIPlugin;
    data?: TDataPlugin;
}