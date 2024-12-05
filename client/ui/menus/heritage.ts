import { createSkinCamera } from 'anim';
import { cameraShots } from 'constants/camera';
import { FemaleParentIds, FemaleParents, MaleParentIds, MaleParents } from 'constants/parents';
import { store } from 'state';
import { CharacterStore } from 'state/character-store';
import { Menu, MenuItem, MenuPool, NativeUI, Window } from 'ui';
import { Logger } from 'utils/logger';
import { getZtOIndex } from 'utils/misc';

interface IUIHeritageMenuContext {
    mumItem: MenuItem;
    dadItem: MenuItem;
    resemblanceItem: MenuItem;
    skinToneItem: MenuItem;
    heritageWindow: Window;
}

export const UIHeritageMenuContext: Partial<IUIHeritageMenuContext> = {

};

export function addMenuHeritage(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const parents = [...Array<number>(46)].map((_, i) => `${i}`.padStart(2, '0'));

    const moms = FemaleParentIds;
    const dads = MaleParentIds;

    const parentNames = parents.map((parentId) => FemaleParents[moms.indexOf(parentId as typeof moms[number])] ?? MaleParents[dads.indexOf(parentId as typeof dads[number])]);

    const { character: Character } = store;
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Heritage', 'Select to choose your parents.', true, true);

    function getParentIndex([firstParents, secondParents]: [typeof moms, typeof dads] | [typeof dads, typeof moms], parentId: number): number | `-${number}` {
        const index = secondParents.findIndex((secondParentId) => Number(secondParentId) === parentId);
        if (index >= 0) {
            return `-${index}`;
        }

        return firstParents.findIndex((firstParentId) => Number(firstParentId) === parentId);
    }

    // We're doing something really fucky here so hear me out:
    // my cursed-ass fork of NativeUILua can accept an integer suffixed with a minus sign (as a string) in order to flip the gender in the heritage panel.
    // This is because that NativeUI resource seems to only allow one female and one male parent, instead of allowing two of the same,
    // so we use getParentIndex() to first look up if parent 1 (assumed to be of gender A) exists in gender B, and if so, prepend a minus sign to the ID. Repeat the same for parent 2.
    const heritage = NativeUI.CreateHeritageWindow(getParentIndex([moms, dads], Character.mom), getParentIndex([dads, moms], Character.dad));
    NativeUI.Menu.AddWindow(submenu, heritage);
    UIHeritageMenuContext.heritageWindow = heritage;

    const momItem = NativeUI.CreateListItem('Parent #1', parentNames, Character['mom'] + 1, 'Select your Mom.');
    NativeUI.Menu.AddItem(submenu, momItem);
    UIHeritageMenuContext.mumItem = momItem;

    const dadItem = NativeUI.CreateListItem('Parent #2', parentNames, Character['dad'] + 1, 'Select your Dad.');
    NativeUI.Menu.AddItem(submenu, dadItem);
    UIHeritageMenuContext.dadItem = dadItem;


    NativeUI.setEventListener(submenu, 'OnListChange', (sender, item, index) => {
        if (item === dadItem) {
            store.actions.setDdad(index - 1);
            store.actions.setDad(Number(parents[index - 1]));
        } else if (item === momItem) {
            store.actions.setDmom(index - 1);
            store.actions.setMom(Number(parents[index - 1]));
        }
        const parent1 = dads.find((d) => Number(d) === Character.mom) ? `-${dads.findIndex((d) => Number(d) === Character.mom)}` : moms.findIndex((m) => Number(m) === Character.mom);
        const parent2 = moms.find((m) => Number(m) === Character.dad) ? `-${moms.findIndex((m) => Number(m) === Character.dad)}` : dads.findIndex((d) => Number(d) === Character.dad);
        NativeUI.Window.Index(heritage, parent1 as number, parent2 as number);
        const immediate = setImmediate(() => {
            SetPedHeadBlendData(PlayerPedId(), Character['mom'], Character['dad'], 0, Character['mom'], Character['dad'], 0, Character['resemblance'], Character['skintone'], 0, true);
            clearImmediate(immediate);
        });
    });


    // array  that counts from 0 to 1 with decimals
    const ZtO = new Array<number>(10);
    for (let i = 0; i <= 10; i++) {
        ZtO[i] = i / 10;
    }

    const resemblanceIndex = 1 + ZtO.reduce((closestIdx, decimal, idx) => Math.abs(ZtO[closestIdx] - Character.resemblance) > Math.abs(decimal - Character.resemblance) ? idx : closestIdx, 0);
    const skintoneIndex = 1 + ZtO.reduce((closestIdx, decimal, idx) => Math.abs(ZtO[closestIdx] - Character.skintone) > Math.abs(decimal - Character.skintone) ? idx : closestIdx, 0);

    const resemblanceItem = NativeUI.CreateSliderItem('Resemblance', ZtO, resemblanceIndex, 'Select if your features are influenced more by your Mother or Father.', true);
    NativeUI.Menu.AddItem(submenu, resemblanceItem);
    UIHeritageMenuContext.resemblanceItem = resemblanceItem;

    const skintoneItem = NativeUI.CreateSliderItem('Skin Tone', ZtO, skintoneIndex, 'Select if your skin tone is influenced more by your Mother or Father.', true);
    NativeUI.Menu.AddItem(submenu, skintoneItem);
    UIHeritageMenuContext.skinToneItem = skintoneItem;

    NativeUI.setEventListener(submenu, 'OnSliderChange', (sender, item, index) => {
        if (item === resemblanceItem || item === skintoneItem) {
            switch (item) {
                case resemblanceItem:
                    Logger.log(`changing resemblance to ${ZtO[index - 1]}`);
                    store.actions.setResemblance(ZtO[index - 1]);
                    break;
                case skintoneItem:
                    Logger.log(`changing skin tone to ${ZtO[index - 1]}`);
                    store.actions.setSkintone(ZtO[index - 1]);
                    break;
            }

            const immediate = setImmediate(() => {
                const { character: Character } = store;
                Logger.log(`resemblance: ${Character.resemblance}, skintone: ${Character.skintone}`);
                SetPedHeadBlendData(PlayerPedId(), Character['mom'], Character['dad'], 0, Character['mom'], Character['dad'], 0, Character['resemblance'], Character['skintone'], 0, true);
                clearImmediate(immediate);
            });
        }
    });

    NativeUI.setEventListener(parentMenu, 'OnMenuChanged', (parent, menu) => {
        if (menu === submenu) {
            createSkinCamera(cameraShots.face);
            // CreateSkinCam('face')
            NativeUI.MenuItem.Index(resemblanceItem, Character.resemblance * 10 + 1);
            NativeUI.MenuItem.Index(skintoneItem, Character.skintone * 10 + 1);
        }
    });
    NativeUI.setEventListener(submenu, 'OnMenuClosed', () => {
        createSkinCamera(cameraShots.body);
        // CreateSkinCam('body')
    });
}

/**
 * Resets the heritage menu values to current values from the store.
 * @param param0 
 */
export function resetMenuHeritage({ character }: CharacterStore = store) {
    UIHeritageMenuContext.mumItem && NativeUI.MenuListItem.Index(UIHeritageMenuContext.mumItem, character.mom + 1);
    UIHeritageMenuContext.dadItem && NativeUI.MenuListItem.Index(UIHeritageMenuContext.dadItem, character.dad + 1);
    UIHeritageMenuContext.resemblanceItem && NativeUI.MenuListItem.Index(UIHeritageMenuContext.resemblanceItem, getZtOIndex(character.resemblance) + 1);
    UIHeritageMenuContext.skinToneItem && NativeUI.MenuListItem.Index(UIHeritageMenuContext.skinToneItem, getZtOIndex(character.skintone) + 1);

    if (UIHeritageMenuContext.heritageWindow) {
        const moms = FemaleParentIds;
        const dads = MaleParentIds;
        const parent1 = dads.find((d) => Number(d) === character.mom) ? `-${dads.findIndex((d) => Number(d) === character.mom)}` : moms.findIndex((m) => Number(m) === character.mom);
        const parent2 = moms.find((m) => Number(m) === character.dad) ? `-${moms.findIndex((m) => Number(m) === character.dad)}` : dads.findIndex((d) => Number(d) === character.dad);
        NativeUI.Window.Index(UIHeritageMenuContext.heritageWindow, parent1 as number, parent2 as number);
    }
}