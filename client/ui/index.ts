import { animateCharCreatorIntro, animateCharCreatorOutro } from 'anim';
import { ActiveCharacterKvpName } from 'constants/misc';
import vMenuPlugin from 'plugins/vmenu';
import { inputState, store } from 'state';
import { CharacterStore } from 'state/character-store';
import { addMenuApparel } from './menus/apparel';
import { addAdvancedApparelMenu } from './menus/apparel/advanced';
import { addMenuAppearance, resetMenuAppearance } from './menus/appearance';
import { addMenuFaceShape, resetMenuFaceShape } from './menus/face-shape';
import { addMenuGender, resetMenuGender } from './menus/gender';
import { addMenuHeritage, resetMenuHeritage } from './menus/heritage';
import { addSavedCharactersMenu, UISavedCharactersMenuContext } from './menus/saved-characters';
import { Menu, MenuPool, NativeUI } from './native-ui-wrapper';
export * from './native-ui-wrapper';

export const UIContext = {
    menuPool: undefined as MenuPool,
    creatorMainMenu: undefined as Menu,
    mainMenu: undefined as Menu,
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

    NativeUI.setEventListener(mainMenu, 'OnMenuChanged', (parent, menu) => {
        if (menu === creatorMainMenu && !inputState.blockMenuButtons/* && Boolean(GetConvar("lbgchar_disableCreator", "false")) !== true*/) {
            const immediate = setImmediate(() => {
                NativeUI.Menu.Visible(creatorMainMenu, false);
                inputState.setInCreator(true);
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                animateCharCreatorIntro().then(() => {
                    clearImmediate(immediate);
                });
            });
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

    UIContext.creatorMainMenu = creatorMainMenu;
    UIContext.mainMenu = mainMenu;
    UIContext.menuPool = menuPool;

    NativeUI.MenuPool.Add(menuPool, mainMenu);

    NativeUI.setEventListener(creatorMainMenu, 'OnMenuClosed', () => {
        NativeUI.Menu.Visible(mainMenu, false);
        inputState.blockMenuButtons = true;
        TriggerEvent('alertbox:message', 'alert', 'Are you sure you want to exit? Unsaved changes will be lost.', ['YES', 'BACK_ESC'], undefined, undefined, true, undefined, (_: never, outcome: 'YES' | 'BACK_ESC') => {
            if (outcome === 'YES') {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                animateCharCreatorOutro(false).then(() => {
                    inputState.blockMenuButtons = false;
                    inputState.setInCreator(false);
                });
            } else {
                NativeUI.Menu.Visible(creatorMainMenu, true);
                inputState.blockMenuButtons = false;
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
    addMenuHeritage(menuPool, creatorMainMenu, store);
    addMenuFaceShape(menuPool, creatorMainMenu, store);
    addMenuAppearance(menuPool, creatorMainMenu, store);
    // addMenuUpperBody(menuPool, creatorMainMenu, store);
    addAdvancedApparelMenu(menuPool, creatorMainMenu, store);
    await addMenuApparel(menuPool, creatorMainMenu, store);
    addSavedCharactersMenu(menuPool, creatorMainMenu, 'menu');
    addSavedCharactersMenu(menuPool, mainMenu, 'menuQuick');
    vMenuPlugin.ui.addvMenuCharacterList(menuPool, creatorMainMenu, store);
    vMenuPlugin.ui.addvMenuCharacterList(menuPool, mainMenu, store);
    addFinishButton(menuPool, creatorMainMenu);

    NativeUI.MenuPool.MouseEdgeEnabled(menuPool, false);
}

export function resetMenus(charStore: Pick<CharacterStore, 'character'>) {
    resetMenuGender(charStore);
    resetMenuHeritage(charStore);
    resetMenuFaceShape(charStore);
    resetMenuAppearance(charStore);
}