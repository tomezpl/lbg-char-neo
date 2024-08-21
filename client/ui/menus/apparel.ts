import { ChangeComponents } from "ped";
import { CharacterStore } from "state/character-store";
import { Menu, MenuPool, NativeUI } from "ui";

export function addMenuApparel(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, "Apparel", "Select to change your Apparel.", true, true);

    const { character } = store;

    const outfits = [
        "Racing Default",
        "Biker Apparel",
        "Freemode Classic",
        "Double Agent",
        "lambdaguy101"
    ] as const;

    const haveGlasses = ["No", "Yes"] as const;

    const femaleGlassesDrawables = [5, 11] as const;
    const maleGlassesDrawables = [11, 5] as const;

    const outfitItem = NativeUI.CreateListItem("Outfit", outfits, character.outfit, "Make changes to your Apparel.")
    NativeUI.Menu.AddItem(submenu, outfitItem);

    const glassesItem = NativeUI.CreateListItem("Aviators", haveGlasses, character.glasses + 1, "Make changes to your Apparel.");
    NativeUI.Menu.AddItem(submenu, glassesItem);

    NativeUI.setEventListener(submenu, "OnListChange", (sender, item, index) => {
        if (item === outfitItem) {
            store.actions.setOutfit(index - 1);
            ChangeComponents(false);
        }

        if (item === glassesItem) {
            store.actions.setGlasses(index - 1);

            SetPedPropIndex(PlayerPedId(), 1, (character.gender === "Male" ? maleGlassesDrawables : femaleGlassesDrawables)[index - 1], 0, true);
        }
    });
}