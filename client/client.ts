import { Character, MPFemale, MPMale } from 'constants/character';
import { ActiveCharacterKvpName, OldLbgCharKvpName } from 'constants/misc';
import { RefreshModel } from 'ped';
import { store } from 'state';
import { CharacterStoreActions } from 'state/character-store';
import { RunUI, NativeUI, UIContext } from 'ui';
import { Logger } from 'utils/logger';

Logger.log('Client Resource Started');
Logger.log('testing');

function RestoreSavedCharacter() {
    let key: string = ActiveCharacterKvpName;
    Logger.log(`Attempting to restore a saved character from '${key}'`);
    let activeCharacterJson = GetResourceKvpString(key);
    const charExists = () => typeof activeCharacterJson === 'string' && activeCharacterJson[0] === '{';

    // Try looking up a character from the original lbg-char (pre-fork) if we don't have a neo char yet.
    if (!charExists()) {
        Logger.warn(`'${ActiveCharacterKvpName}' could not be found, trying '${OldLbgCharKvpName}' (legacy)`);
        key = OldLbgCharKvpName;
        activeCharacterJson = GetResourceKvpString(key);
        if (!charExists()) {
            activeCharacterJson = GetExternalKvpString('lbg-char', key);
        }
    }

    if (charExists()) {
        Logger.log(`Found a saved character in '${key}'`);
        const parsed = JSON.parse(activeCharacterJson) as Character;

        // Apply all properties from the saved character JSON to the CharacterStore.
        Object.entries(parsed).forEach(([prop, value]: [keyof Character, Character[keyof Character]]) => {
            // Create the action name from the property name (the format is 'setProperty').
            const actionKey = `set${prop.slice(0, 1).toUpperCase()}${prop.slice(1)}` as keyof CharacterStoreActions;
            store.actions[actionKey](value as never);
        });

        // Set the model hash based on the character gender.
        store.mdhash = GetHashKey([MPFemale, MPMale][+((parsed.ogd?.toLowerCase()[0] || 'm') !== 'f')]);
    } else {
        Logger.warn(`Could not find a saved character in neither '${ActiveCharacterKvpName}' nor '${OldLbgCharKvpName}', skipping character restore.`);
    }
}

RestoreSavedCharacter();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
RunUI();

on('lbg-openChar', () => {
    NativeUI.Menu.Visible(UIContext.mainMenu, true);
});

// TODO: add an (optional) key binding too
RegisterCommand('charedit', () => {
    emit('lbg-openChar');
}, false);

RegisterCommand('die', () => {
    SetEntityHealth(PlayerPedId(), 0);
}, false);

on('playerSpawned', () => {
    RefreshModel(true, store.character);
});

RegisterKeyMapping('charedit', 'Open lbg-char-neo character menu.', 'keyboard', 'm');
RegisterKeyMapping('charedit', 'Open lbg-char-neo character menu.', 'pad_digitalbutton', 'select_index');
