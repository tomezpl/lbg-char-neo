import { IPlugin } from 'types/plugin';
import { getVMenuCharacters } from './import';
import { applyVMenuCharacter } from './ped';
import { addvMenuCharacterList } from './ui';

const plugin = {
    data: { getVMenuCharacters } as const,
    ped: { applyVMenuCharacter } as const,
    ui: { addvMenuCharacterList } as const,
};

export default plugin as IPlugin<typeof plugin['ped'], typeof plugin['ui'], typeof plugin['data']>;