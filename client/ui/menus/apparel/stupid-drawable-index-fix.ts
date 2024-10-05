import type { ComponentDrawables } from "state/clothing-store";

/**
 * Acts as a for-each over a dumped component's drawables object because FiveM doesn't load mpSum2 gen9 EC stuff,
 * so drawable IDs after mpSum2 get messed up.
 * @param drawables 
 * @param callback 
 */
export function iterateDrawables(drawables: ComponentDrawables, callback: (fixedIndex: number, originalIndex: number, textureVariations: ComponentDrawables[keyof ComponentDrawables]) => void) {
    let skipped = 0;
    let foundSum2Gen9 = false;
    let foundDrugWars = false;
    let lastSum2DrawableIndex = -1;
    let firstPostSum2Gen9Index = -1;
    Object.entries(drawables).forEach(([drawableIdString, textures]) => {
        const drawableId = Number(drawableIdString);

        if (textures[0].label.toUpperCase().startsWith("CLO_E1")) {
            foundSum2Gen9 = true;
        }
        if (["X6", "SC", "X7", "SD"].some((dlc) => textures[0].label.toUpperCase().startsWith(`CLO_${dlc}`))) {
            foundDrugWars = true;
        }


        if (!(foundSum2Gen9 || foundDrugWars) && textures[0].label.toUpperCase().startsWith("CLO_SB")) {
            if (drawableId > lastSum2DrawableIndex) {
                lastSum2DrawableIndex = drawableId;
            }
        }
        if (firstPostSum2Gen9Index === -1 && (foundSum2Gen9 || foundDrugWars) && !textures[0].label.toUpperCase().startsWith("CLO_E1") && textures[0].label !== "" && textures[0].label !== "-99") {
            firstPostSum2Gen9Index = drawableId;

            if (lastSum2DrawableIndex !== -1) {
                skipped = (firstPostSum2Gen9Index - lastSum2DrawableIndex) - 1;
            }
        }

        callback(drawableId - skipped, drawableId, textures);
    });

    console.log(`${lastSum2DrawableIndex} ${firstPostSum2Gen9Index} ${skipped}`);
}