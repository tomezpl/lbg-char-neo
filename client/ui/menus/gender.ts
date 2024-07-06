import { CharacterStore } from "state/character-store";
import { Menu, NativeUI } from "ui"
import type { Character } from "constants/character";

export function addMenuGender(parentMenu: Menu, store: CharacterStore) {
    const genders: readonly [Character['gender'], Character['gender']] = [
        "Male",
        "Female"
    ] as const;
 
    const {character} = store;
	const genderIndex = character.gender === "Female" ? 1 : 0;

    const genderItem = NativeUI.CreateListItem("Sex", genders, genderIndex, "Select the gender of your Character.");
    NativeUI.Menu.AddItem(parentMenu, genderItem)

    NativeUI.setEventListener(parentMenu, 'OnListChange', (sender, item, index) => {
        console.log('OnListChange', ...arguments);
        if(item === genderItem) {
            character["gender"] = genders[index]
            character["ogd"] = genders[index].substring(0, 1) as "M" | "F";
            character["lcgd"] = genders[index].toLowerCase() as Lowercase<typeof genders[number]>;
            // oldmdhash = mdhash
            if(genders[index as keyof typeof genders] == "Male") {
                store.mdhash = GetHashKey("mp_m_freemode_01")
            } else {
                store.mdhash = GetHashKey("mp_f_freemode_01")
            }
            
            RequestModel(store.mdhash)
            character["resemblance"] = 1.0 - character["resemblance"]
            character["skintone"] = 1.0 - character["skintone"]
            // RefreshModel()
        }
    })
}