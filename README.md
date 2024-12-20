# lbg-char-neo
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/tomezpl/lbg-char-neo/build.yml?branch=develop)
![GitHub Release](https://img.shields.io/github/v/release/tomezpl/lbg-char-neo?include_prereleases)

## GTAO-like character creation for FiveM.
[Overview](#overview) | [Features](#features) | [Installation & Usage](#usage) | [Configuration and integrating with other resources](#integration)

### Overview
This is a FiveM resource to provide a character creation menu, complete with a GTAO-like interior environment, native UI, character saving, vMenu imports, localised clothing items and more.

This project started as a fork of [lbg-char](https://github.com/lambits/lbg-char), which has implemented the majority of the camera and animation scripting. This fork rewrites the project in TypeScript for easier maintenance, and adds several new features.

![image](/docs/hair_screenshot.png)

<details>
<summary>More Screenshots</summary>

![image](/docs/clothes_screenshot.png)

![image](/docs/vmenu_import_screenshot.png)

![image](/docs/advanced1_screenshot.png)

![image](/docs/advanced2_screenshot.png)
</details>

### Features
- Character creation experience akin to vanilla GTAO, including the police station interior and animations.
  - This takes networked players into consideration, hiding other players' peds and disabling their collision on the creator screen.
  - This will not work with OneSync servers above 48 players. Support for OneSync will be added in the future.
- Native UI look for a consistent style.
- 20 slots to save characters, which can be loaded at any time
- Key binding for quickly accessing the menu during gameplay
- Ability to choose any parent in either of the two heritage slots
- Partial support for localised clothing item labels, allowing for clothing to be picked by name instead of component drawable IDs
- Partial support for forcing the correct component drawables for specific clothing items, meaning selecting a vest would equip the right undershirt, a dress would equip the right torso type, etc.
  - This is still experimental and might be buggy - please use the Advanced Apparel Options menu to fix any component compatiblity issues.
- An Advanced Apparel Options menu to fine-tune ped component slots. Useful for bypassing clothing restrictions or compatibility issues.
- Support for importing MP Characters from vMenu.
  - While this feature largely works straightaway, you might need to make minor tweaks to your character's appearance after importing - it's advised that you save them for quick access.
- Ability to integrate with other resources through convars and events (see [Integration](#integration))

### Usage

1. Download the latest [release](https://github.com/tomezpl/lbg-char-neo/releases).
    - The build includes two dependencies - NativeUILua and alertbox.
2. Extract the archive into your Cfx server's `server-data/resources/`
3. In your Cfx server's config file (typically `server.cfg`), add `ensure lbg-char-neo`
4. Start FiveM and connect to your server
5. Press the 'M' key on your keyboard to access the character menu.
   - From here, you can choose to head into the Character Creator screen. You can save a character by going to Character Creator -> Saved Characters, selecting a character slot and hitting Spacebar.
   - You can also access the Saved Characters menu to quickly load a previously saved character at any moment.
   - If you have any saved MP characters created using vMenu, an "Import from vMenu" button will appear, allowing you to load your vMenu characters.
6. You can change some settings of this resource via [Convars](#convars).

### Integration
#### Convars
[Convars](https://docs.fivem.net/docs/scripting-reference/convars/) are FiveM's way of configuring variables that can be used by the resource.

You can provide your own values for these convars in your `server.cfg` file. This is handy for integrating several resources to work together.

This character creator resource exposes the following convars:

| Convar | Description | Default value |
| --- | --- | --- |
| `lbg-char-neo_blockCreator` | Should the "Character Creator" button in the lbg-char-neo menu be blocked? | false |
| `lbg-char-neo_restoreModelOnSpawn` | Should the player ped's model be set to the current saved character on each `playerSpawned` event? | true | 
| `lbg-char-neo_createCommand` | Should the /charedit console command be created to open the character menu? This requires a resource restart to apply. | true |
| `lbg-char-neo_createKeybind` | Should a key binding be created to open the character menu? This requires `lbg-char-neo_createCommand` to be `true`. | true |

These are supposed to be server-replicated, so you'll want to use the `setr` command, like so: `setr lbg-char-neo_restoreModelOnSpawn false`.

#### Events
If you want to integrate this resource with your own script, these are the events emitted or listened to by lbg-char-neo:

##### `lbg-char-neo:pedChanged` emitter
This event is emitted whenever the creator changes player ped's model.

This is useful for re-applying ped config flags, health, weapons, etc.

##### `lbg-char-neo:creatorEntered` emitter
This event is emitted whenever the player enters the Character Creator screen.

##### `lbg-char-neo:creatorExited` emitter
This event is emitted whenever the player leaves the Character Creator screen and has been teleported back to their original position.

##### `lbg-char-neo:forceExit` listener
This event can be triggered by another client resource to force the player out of the Character Creator screen.

##### `lbg-openChar` listener
This event can be triggered by any client resource to show the character menu - note this does not take the player to the Character Creator screen, but instead displays an Interaction Menu-like UI with the following options:

- Character Creator
- Saved Characters
- Import from vMenu