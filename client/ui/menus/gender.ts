import { CharacterStore } from 'state/character-store';
import { Menu, MenuItem, NativeUI } from 'ui'
import type { Character } from 'constants/character';
import { RefreshModel } from 'ped';
import { store } from 'state';

interface IUIGenderMenuContext {
    genderItem: MenuItem;
}

export const UIGenderMenuContext: Partial<IUIGenderMenuContext> = {

};

export function addMenuGender(parentMenu: Menu, store: CharacterStore) {
    const genders: readonly [Character['gender'], Character['gender']] = [
        'Male',
        'Female'
    ] as const;

    const { character } = store;
    const genderIndex = character.gender === 'Female' ? 2 : 1;

    const genderItem = NativeUI.CreateListItem('Sex', genders, genderIndex, 'Select the gender of your Character.');
    NativeUI.Menu.AddItem(parentMenu, genderItem)

    UIGenderMenuContext.genderItem = genderItem;

    NativeUI.setEventListener(parentMenu, 'OnListChange', (sender, item, index) => {
        // Lua is 1-indexed
        if (typeof index === 'number') {
            index -= 1;
        }
        if (item === genderItem) {
            store.actions.setGender(genders[index]);
            store.actions.setOgd(genders[index].substring(0, 1) as 'M' | 'F');
            store.actions.setLcgd(genders[index].toLowerCase() as Lowercase<typeof genders[number]>)
            // oldmdhash = mdhash
            if (genders[index as keyof typeof genders] == 'Male') {
                store.mdhash = GetHashKey('mp_m_freemode_01')
            } else {
                store.mdhash = GetHashKey('mp_f_freemode_01')
            }

            RequestModel(store.mdhash)
            // store.actions.setResemblance(1.0 - character.resemblance);
            // store.actions.setSkintone(1.0 - character.resemblance);
            RefreshModel(true)
        }
    })
}

/**
 * Resets gender menu values to current characte from the store.
 * @param param0 
 */
export function resetMenuGender({ character }: CharacterStore = store) {
    UIGenderMenuContext.genderItem && NativeUI.MenuListItem.Index(UIGenderMenuContext.genderItem, character.gender === 'Female' ? 2 : 1);
}