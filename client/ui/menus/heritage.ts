import { createSkinCamera } from "anim";
import { cameraShots } from "constants/camera";
import { FemaleParents, MaleParents } from "constants/parents";
import { CharacterStore } from "state/character-store";
import { Menu, MenuPool, NativeUI } from "ui"

export function addMenuHeritage(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const parents = [...Array(46)].map((_, i) => `${i}`.padStart(2, '0'));

    // Female heads
    const moms = ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "45"]
    // Male heads
    const dads = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "42", "43", "44"];

    const parentNames = parents.map((parentId) => FemaleParents[moms.indexOf(parentId)] ?? MaleParents[dads.indexOf(parentId)]);

    const { character: Character } = store;
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Heritage", "Select to choose your parents.", true, true);
    const heritage = NativeUI.CreateHeritageWindow(
        dads.find((d) => Number(d) === Character.mom) ? `-${dads.findIndex((d) => Number(d) === Character.mom)}` : moms.findIndex((m) => Number(m) === Character.mom),
        moms.find((m) => Number(m) === Character.dad) ? `-${moms.findIndex((m) => Number(m) === Character.dad)}` : dads.findIndex((d) => Number(d) === Character.dad)
    );
    NativeUI.Menu.AddWindow(submenu, heritage);

    const momItem = NativeUI.CreateListItem("Parent #1", parentNames, Character["mom"] + 1, "Select your Mom.");
    NativeUI.Menu.AddItem(submenu, momItem);

    const dadItem = NativeUI.CreateListItem("Parent #2", parentNames, Character["dad"] + 1, "Select your Dad.");
    NativeUI.Menu.AddItem(submenu, dadItem);


    NativeUI.setEventListener(submenu, 'OnListChange', (sender, item, index) => {
        if (item === dadItem) {
            store.actions.setDdad(index - 1);
            store.actions.setDad(Number(parents[index - 1]))
        } else if (item === momItem) {
            store.actions.setDmom(index - 1);
            store.actions.setMom(Number(parents[index - 1]))
        }
        const parent1 = dads.find((d) => Number(d) === Character.mom) ? `-${dads.findIndex((d) => Number(d) === Character.mom)}` : moms.findIndex((m) => Number(m) === Character.mom);
        const parent2 = moms.find((m) => Number(m) === Character.dad) ? `-${moms.findIndex((m) => Number(m) === Character.dad)}` : dads.findIndex((d) => Number(d) === Character.dad);
        NativeUI.Window.Index(heritage, parent1 as number, parent2 as number);
        const immediate = setImmediate(() => {
            SetPedHeadBlendData(PlayerPedId(), Character["mom"], Character["dad"], 0, Character["mom"], Character["dad"], 0, Character["resemblance"], Character["skintone"], 0, true);
            clearImmediate(immediate);
        });
    })


    // array  that counts from 0 to 1 with decimals
    const ZtO = new Array<number>(10);
    for (let i = 0; i <= 10; i++) {
        ZtO[i] = i / 10;
    }

    const resemblanceIndex = 1 + ZtO.reduce((closestIdx, decimal, idx) => Math.abs(ZtO[closestIdx] - Character.resemblance) > Math.abs(decimal - Character.resemblance) ? idx : closestIdx, 0);
    const skintoneIndex = 1 + ZtO.reduce((closestIdx, decimal, idx) => Math.abs(ZtO[closestIdx] - Character.skintone) > Math.abs(decimal - Character.skintone) ? idx : closestIdx, 0);

    const resemblanceItem = NativeUI.CreateSliderItem("Resemblance", ZtO, resemblanceIndex, "Select if your features are influenced more by your Mother or Father.", true);
    NativeUI.Menu.AddItem(submenu, resemblanceItem);

    const skintoneItem = NativeUI.CreateSliderItem("Skin Tone", ZtO, skintoneIndex, "Select if your skin tone is influenced more by your Mother or Father.", true)
    NativeUI.Menu.AddItem(submenu, skintoneItem);

    NativeUI.setEventListener(submenu, 'OnSliderChange', (sender, item, index) => {
        if (item === resemblanceItem || item === skintoneItem) {
            switch (item) {
                case resemblanceItem:
                    console.log(`changing resemblance to ${ZtO[index - 1]}`)
                    store.actions.setResemblance(ZtO[index - 1]);
                    break;
                case skintoneItem:
                    console.log(`changing skin tone to ${ZtO[index - 1]}`)
                    store.actions.setSkintone(ZtO[index - 1]);
                    break;
            }

            const immediate = setImmediate(() => {
                SetPedHeadBlendData(PlayerPedId(), Character["mom"], Character["dad"], 0, Character["mom"], Character["dad"], 0, Character["resemblance"], Character["skintone"], 0, true)
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