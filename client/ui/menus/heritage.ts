import { FemaleParents, MaleParents } from "constants/parents";
import { CharacterStore } from "state/character-store";
import { Menu, MenuPool, NativeUI } from "ui"

export function addMenuHeritage(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const {character: Character} = store;
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Heritage", "Select to choose your parents.", true, true);
    const heritage = NativeUI.CreateHeritageWindow(Character["dmom"], Character["ddad"]);
    NativeUI.Menu.AddWindow(submenu, heritage);
	
    // Female heads
	const moms = ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "45"]
    const momItem = NativeUI.CreateListItem("Mom", FemaleParents, Character["dmom"], "Select your Mom.");
    NativeUI.Menu.AddItem(submenu, momItem);
	
    // Male heads
	const dads = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "42", "43", "44"];
    const dadItem = NativeUI.CreateListItem("Dad", MaleParents, Character["ddad"] + 1, "Select your Dad.");
    NativeUI.Menu.AddItem(submenu, dadItem);

    NativeUI.setEventListener(submenu, 'OnListChange', (sender, item, index) => {
        if(item === dadItem) {
            store.actions.setDdad(index - 1);
            store.actions.setDad(Number(dads[index - 1]))
        } else if(item === momItem) {
            store.actions.setDmom(index - 1);
            store.actions.setMom(Number(moms[index - 1]))
        }
        NativeUI.Window.Index(heritage, Character["dmom"], Character["ddad"]);
        const immediate = setImmediate(() => {
            SetPedHeadBlendData(PlayerPedId(), Character["mom"], Character["dad"], 0, Character["mom"], Character["dad"], 0, Character["resemblance"], Character["skintone"], 0, true);
            clearImmediate(immediate);
        });
    })
	
    // array  that counts from 0 to 1 with decimals
	const ZtO = new Array<number>(10);
    for(let i = 0; i <= 10; i++) {
        ZtO[i] = i / 10;
    }
	
	const resemblanceItem = NativeUI.CreateSliderItem("Resemblance", ZtO, Character["resemblance"], "Select if your features are influenced more by your Mother or Father.", true);
    NativeUI.Menu.AddItem(submenu, resemblanceItem);
	
	const skintoneItem = NativeUI.CreateSliderItem("Skin Tone", ZtO, Character["skintone"], "Select if your skin tone is influenced more by your Mother or Father.", true)
    NativeUI.Menu.AddItem(submenu, skintoneItem);
 
    NativeUI.setEventListener(submenu, 'OnSliderChange', (sender, item, index) => {
        if(item === resemblanceItem || item === skintoneItem) {
            switch(item) {
                case resemblanceItem:
                    store.actions.setResemblance(ZtO[index - 1]);
                case skintoneItem:
                    store.actions.setSkintone(ZtO[index - 1]);
            }

            const immediate = setImmediate(() => {
                SetPedHeadBlendData(PlayerPedId(), Character["mom"], Character["dad"], 0, Character["mom"], Character["dad"], 0, Character["resemblance"], Character["skintone"], 0, true)
                clearImmediate(immediate);
            });
        }
    });
	
    /*NativeUI.setEventListener(parentMenu, 'OnMenuChanged', (parent, menu) => {
        if(menu === submenu) {
            // CreateSkinCam('face')
            NativeUI.MenuItem.Index(resemblanceItem, Character.resemblance * 10 + 1);
            NativeUI.MenuItem.Index(skintoneItem, Character.skintone * 10 + 1);
        }
    });*/
    NativeUI.setEventListener(submenu, 'OnMenuClosed', () => {
        // CreateSkinCam('body')
    });
}