import { createSkinCamera } from 'anim';
import { cameraShots } from 'constants/camera';
import { Character } from 'constants/character';
import { store } from 'state';
import { CharacterStore } from 'state/character-store';
import { Menu, MenuItem, MenuPool, NativeUI } from 'ui';

export const UIFaceShapeMenuContext: Partial<Record<`${keyof Character}_item`, MenuItem>> = {
}

export const FaceFeatureNameMap: ReadonlyArray<[name: string, featureName: keyof Character, featureIndex?: number]> = [
	['Nose Width', 'nose_1'],
	['Nose Peak Height', 'nose_2'],
	['Nose Peak Length', 'nose_3'],
	['Nose Bone Height', 'nose_4'],
	['Nose Peak Lowering', 'nose_5'],
	['Nose Bone Twist', 'nose_6'],
	['Eyebrow Depth', 'eyebrows_5', 7],
	['Eyebrow Height', 'eyebrows_6', 6],
	['Cheekbones Height', 'cheeks_1', 8],
	['Cheekbones Width', 'cheeks_2'],
	['Cheeks Width', 'cheeks_3'],
	['Eye Opening', 'eye_open'],
	['Lips Thickness', 'lips_thick'],
	['Jaw Bone Width', 'jaw_1'],
	['Jaw Bone Depth', 'jaw_2'],
	['Chin Height', 'chin_height'],
	['Chin Depth', 'chin_length'],
	['Chin Width', 'chin_width'],
	['Chin Hole Size', 'chin_hole'],
	['Neck Thickness', 'neck_thick']
];

export function addMenuFaceShape(menuPool: MenuPool, parentMenu: Menu, store: CharacterStore) {
	const listItems = new Array<string>();
	for (let i = -1.0; i <= 1.0; i += 0.1) {
		listItems.push(`${i.toFixed(1)}`);
	}

	const { character, actions } = store;

	const submenu = NativeUI.MenuPool.AddSubMenu(menuPool, parentMenu, 'Features', 'Select to alter your facial Features.', true, false)

	const features = FaceFeatureNameMap;

	features.reduce((featureIndex, [name, featureName, currentFeatureIndex]) => {
		if (typeof currentFeatureIndex === 'number') {
			featureIndex = currentFeatureIndex || 0;
		}

		const featureItem = NativeUI.CreateSliderItem(name, listItems, ((character[featureName] as number) + 1) * 10 + 1, 'Make changes to your physical Features.', true);
		NativeUI.Menu.AddItem(submenu, featureItem);

		const uiItemKey: keyof typeof UIFaceShapeMenuContext = `${featureName}_item`;
		UIFaceShapeMenuContext[uiItemKey] = featureItem;

		NativeUI.setEventListener(featureItem, 'OnSliderChanged', (sender, item, index) => {
			console.log(`setting feature ${featureIndex} to ${Number(listItems[index - 1])}`);
			SetPedFaceFeature(PlayerPedId(), featureIndex, Number(listItems[index - 1]));
			const setterKey = `set${(featureName as string).slice(0, 1).toUpperCase()}${(featureName as string).slice(1)}` as keyof typeof actions;
			actions[setterKey](Number(listItems[index - 1]) as never);
		})

		return featureIndex + 1;
	}, 0);

	NativeUI.setEventListener(parentMenu, 'OnMenuChanged', (parent, menu) => {
		if (submenu === menu) {
			createSkinCamera(cameraShots.face);
			// CreateSkinCam('face');
		}
	});

	NativeUI.setEventListener(submenu, 'OnMenuClosed', () => {
		createSkinCamera(cameraShots.body);
		// CreateSkinCam('body');
	});
}

export function resetMenuFaceShape({ character }: Pick<CharacterStore, 'character'> = store) {
	FaceFeatureNameMap.forEach(([, featureName]) => {
		const item = UIFaceShapeMenuContext[`${featureName}_item`];
		if (item) {
			const value = character[featureName] as number;
			NativeUI.MenuListItem.Index(item, (value + 1) * 10 + 1);
		}
	})
}