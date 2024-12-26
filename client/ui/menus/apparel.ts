import { ClothingItemCategories } from 'constants/clothing';
import { ChangeComponents } from 'ped';
import { CharacterStore } from 'state/character-store';
import { clothingStore } from 'state/clothing-store';
import { Menu, MenuPool, NativeUI } from 'ui';
import { createClothingCategorySubmenu } from './apparel/clothing-category-menu';

export async function addMenuApparel(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
    const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Apparel', 'Select to change your Apparel.', true, true);

    const { character } = store;

    const outfits = [
        'Racing Default',
        'Biker Apparel',
        'Freemode Classic',
        'Double Agent',
        'lambdaguy101'
    ] as const;

    const outfitItem = NativeUI.CreateListItem('Outfit', outfits, character.outfit, 'Make changes to your Apparel.')
    NativeUI.Menu.AddItem(submenu, outfitItem);

    // const glassesItem = NativeUI.CreateListItem("Aviators", haveGlasses, character.glasses + 1, "Make changes to your Apparel.");
    // NativeUI.Menu.AddItem(submenu, glassesItem);

    RequestAdditionalText('CLO_MNU', 0);
    for (let i = 0; i < 5 && !HasAdditionalTextLoaded(0); i++) {
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 200);
        });
    }


    const clothingGroupMenus = Object.entries(ClothingItemCategories)
        .reduce((menus, [key, value]) => {
            if (Number.isNaN(Number(key))) {
                const textLabel = `CSHOP_ITEM${value as number}` as const;
                const labelText = DoesTextLabelExist(textLabel) ? GetLabelText(textLabel) : (value as string);
                menus[textLabel] = NativeUI.MenuPool.AddSubMenu(menuPool, submenu, labelText, '', true, false);
            }

            return menus;
        },
            {} as Record<`CSHOP_ITEM${number}`, Menu>);


    NativeUI.setEventListener(submenu, 'OnMenuChanged', (parent, menu) => {
        if (menu === parent || menu === submenu || menu === parentMenu) {
            return;
        }

        NativeUI.Menu.Clear(menu);

        const [categoryLabel] = Object.entries(clothingGroupMenus).find(([, _menu]) => _menu === menu) || [];

        const pedComponents = clothingStore[`mp_${character.gender[0].toLowerCase()}_freemode_01` as keyof typeof clothingStore];

        switch (Number(categoryLabel?.slice('CSHOP_ITEM'.length)) as typeof ClothingItemCategories[keyof typeof ClothingItemCategories]) {
            case ClothingItemCategories.Tops:
                createClothingCategorySubmenu(menuPool, menu, pedComponents, ['torso', 'upper', 'armour']);
                break;
            case ClothingItemCategories.Pants:
                createClothingCategorySubmenu(menuPool, menu, pedComponents, ['lower', 'upper']);
                break;
            case ClothingItemCategories.Shoes:
                createClothingCategorySubmenu(menuPool, menu, pedComponents, ['feet'], [{ X6: -1 }]);
                break;
            case ClothingItemCategories.Glasses:
                createClothingCategorySubmenu(menuPool, menu, pedComponents, ['p_eyes']);
                break;
            case ClothingItemCategories.Hats:
                createClothingCategorySubmenu(menuPool, menu, pedComponents, ['p_head']);
                break;
            case ClothingItemCategories.Masks:
                createClothingCategorySubmenu(menuPool, menu, pedComponents, ['p_mouth', 'beard']);
                break;
        }
    });

    NativeUI.setEventListener(submenu, 'OnListChange', (sender, item, index) => {
        if (item === outfitItem) {
            store.actions.setOutfit(index - 1);
            ChangeComponents();
        }

        /*
        if (item === glassesItem) {
            store.actions.setGlasses(index - 1);

            SetPedPropIndex(PlayerPedId(), 1, (character.gender === "Male" ? maleGlassesDrawables : femaleGlassesDrawables)[index - 1], 0, true);
        }
        */
    });
}