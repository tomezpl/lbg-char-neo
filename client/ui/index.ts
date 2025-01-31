import { animateCharCreatorIntro, animateCharCreatorOutro } from 'anim';
import { ActiveCharacterKvpName, BlockCharCreatorConvar, ForceCharCreatorExitEventName } from 'constants/misc';
import vMenuPlugin from 'plugins/vmenu';
import { inputState, store } from 'state';
import { CharacterStore } from 'state/character-store';
import { Logger } from 'utils/logger';
import { addMenuApparel } from './menus/apparel';
import { addAdvancedApparelMenu } from './menus/apparel/advanced';
import { addMenuAppearance, resetMenuAppearance } from './menus/appearance';
import { addMenuFaceShape, resetMenuFaceShape } from './menus/face-shape';
import { addMenuGender, resetMenuGender } from './menus/gender';
import { addMenuHeritage, resetMenuHeritage } from './menus/heritage';
import { addSavedCharactersMenu, UISavedCharactersMenuContext } from './menus/saved-characters';
import { Menu, MenuPool, NativeUI } from './native-ui-wrapper';
import { addRotateButtonsToMenu } from './utils';
export * from './native-ui-wrapper';

export const UIContext = {
    menuPool: undefined as MenuPool,
    creatorMainMenu: undefined as Menu,
    mainMenu: undefined as Menu,

    // Client event to trigger upon exiting the main menu
    exitEvent: ''
};

export function addFinishButton(menuPool: MenuPool, parentMenu: Menu) {
    const finishButton = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Save & Continue', 'Ready to play?', true, false);
    const sureButton = NativeUI.CreateItem('Are you sure?', 'Press Enter to continue');
    NativeUI.Menu.AddItem(finishButton, sureButton);
    NativeUI.setEventListener(sureButton, 'Activated', () => {
        if (!inputState.blockMenuButtons) {
            SetResourceKvp(ActiveCharacterKvpName, JSON.stringify(store.character));
            console.log('!!!! SAVING CHARACTER !!!!')
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            animateCharCreatorOutro().then(() => {
                inputState.setInCreator(false);
            });
            NativeUI.Menu.Visible(finishButton, false);
            NativeUI.Menu.Visible(parentMenu, false);
        }
    });
}

export async function RunUI() {
    const menuPool = NativeUI.CreatePool();
    const mainMenu = NativeUI.CreateMenu('Appearance', '~HUD_COLOUR_FREEMODE~EDIT CHARACTER', 47.5, 47.5);;
    const creatorMainMenu = NativeUI.MenuPool.AddSubMenu(menuPool, mainMenu, 'Character Creator', 'Create a GTA Online character.', true, false);

    addRotateButtonsToMenu(creatorMainMenu);

    setTick(() => {
        if (inputState.inCreator) {
            const playerPed = PlayerPedId();
            const controlScales = [[205, 300], [206, -300]] as const;
            for (const [controlId, scale] of controlScales) {
                if (IsControlPressed(2, controlId) || IsDisabledControlPressed(2, controlId)) {
                    const speed = scale * GetFrameTime();
                    const [rotX, rotY, rotZ] = GetEntityRotation(playerPed, 2);
                    SetEntityRotation(playerPed, rotX, rotY, rotZ + speed, 2, false);
                    SetPedDesiredHeading(playerPed, rotZ + speed);
                }
            }
        }
    });

    NativeUI.setEventListener(mainMenu, 'OnMenuChanged', (parent, menu) => {
        const blocked = !!GetConvar(BlockCharCreatorConvar, 'false').match(/"?true"?/i);

        Logger.log(`${BlockCharCreatorConvar} is currently set to ${blocked}`);
        if (menu === creatorMainMenu && !inputState.blockMenuButtons && blocked !== true) {
            UIContext.exitEvent = '';
            const immediate = setImmediate(() => {
                NativeUI.Menu.Visible(creatorMainMenu, false);
                inputState.setInCreator(true);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                animateCharCreatorIntro().then(() => {
                    clearImmediate(immediate);
                });
            });
        }
        else if (menu === creatorMainMenu) {
            NativeUI.Menu.Visible(creatorMainMenu, false);
        }

        if (menu === UISavedCharactersMenuContext.menuQuick) {
            UISavedCharactersMenuContext.blockInput = false;
            UISavedCharactersMenuContext.refresh(UISavedCharactersMenuContext.menuQuick);
            const tick = setTick(() => {
                UISavedCharactersMenuContext.tick(UISavedCharactersMenuContext.menuQuick);
            });
            NativeUI.setEventListener(UISavedCharactersMenuContext.menuQuick, 'OnMenuClosed', () => {
                clearTick(tick);
            });
        }
    });

    NativeUI.setEventListener(mainMenu, 'OnMenuClosed', () => {
        if (UIContext.exitEvent) {
            TriggerEvent(UIContext.exitEvent);
            UIContext.exitEvent = '';
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
                inputState.setLeavingCreator(true);

                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                animateCharCreatorOutro(false).then(() => {
                    inputState.blockMenuButtons = false;
                    inputState.setInCreator(false);
                    inputState.setLeavingCreator(false);
                });
            } else {
                if (inputState.inCreator) {
                    NativeUI.Menu.Visible(creatorMainMenu, true);
                    inputState.blockMenuButtons = false;
                }
            }
        });
    });

    NativeUI.setEventListener(creatorMainMenu, 'OnMenuChanged', (parent, menu) => {
        if (menu === UISavedCharactersMenuContext.menu) {
            UISavedCharactersMenuContext.blockInput = false;
            UISavedCharactersMenuContext.refresh(UISavedCharactersMenuContext.menu);
            const tick = setTick(() => {
                UISavedCharactersMenuContext.tick(UISavedCharactersMenuContext.menu);
            });
            NativeUI.setEventListener(UISavedCharactersMenuContext.menu, 'OnMenuClosed', () => {
                clearTick(tick);
            });
        }
    });

    addMenuGender(creatorMainMenu, store);
    addRotateButtonsToMenu(addMenuHeritage(menuPool, creatorMainMenu, store));
    addRotateButtonsToMenu(addMenuFaceShape(menuPool, creatorMainMenu, store));
    addRotateButtonsToMenu(addMenuAppearance(menuPool, creatorMainMenu, store));
    // addMenuUpperBody(menuPool, creatorMainMenu, store);
    addRotateButtonsToMenu(addAdvancedApparelMenu(menuPool, creatorMainMenu, store));
    addRotateButtonsToMenu(await addMenuApparel(menuPool, creatorMainMenu, store));
    addRotateButtonsToMenu(addSavedCharactersMenu(menuPool, creatorMainMenu, 'menu'));
    addSavedCharactersMenu(menuPool, mainMenu, 'menuQuick');
    const charListMenu = vMenuPlugin.ui.addvMenuCharacterList(menuPool, creatorMainMenu, store);
    if (typeof charListMenu !== 'undefined') {
        addRotateButtonsToMenu(charListMenu);
    }

    vMenuPlugin.ui.addvMenuCharacterList(menuPool, mainMenu, store);
    addFinishButton(menuPool, creatorMainMenu);

    NativeUI.MenuPool.MouseEdgeEnabled(menuPool, false);

    // Listen on other resources requesting the player to exit the character creator.
    on(ForceCharCreatorExitEventName, () => {
        if (inputState.inCreator && !inputState.isLeavingCreator) {
            // Hide the character creator menu.
            NativeUI.Menu.Visible(creatorMainMenu, false);

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            animateCharCreatorOutro(false).then(() => {
                inputState.blockMenuButtons = false;
                inputState.setInCreator(false);
            });
        }
    });
}

export function resetMenus(charStore: Pick<CharacterStore, 'character'>) {
    resetMenuGender(charStore);
    resetMenuHeritage(charStore);
    resetMenuFaceShape(charStore);
    resetMenuAppearance(charStore);
}