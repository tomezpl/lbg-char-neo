function ApplyvMenuCharacter(character)
    -- TODO: this function needs to also update the ui state

    -- Character gender
    local mdHash = "mp_m_freemode_01"
    if character.IsMale == true then
        SetLbgCharacterProp("gender", "Male")
        SetLbgCharacterProp("ogd", "M")
        SetLbgCharacterProp("lcgd", "m")
    else
        SetLbgCharacterProp("gender", "Female")
        SetLbgCharacterProp("ogd", "F")
        SetLbgCharacterProp("lcgd", "f")
        mdHash = "mp_f_freemode_01"
        SetLbgMdhash(mdHash)
    end

    RequestModel(mdHash)

    -- these fields come from PedHeadBlendData serialized in vMenu mp_ped_ KVP strings
    local headBlend = character.PedHeadBlendData
    local momID = headBlend.FirstFaceShape
    local dadID = headBlend.SecondFaceShape
    local shapeMix = headBlend.ParentFaceShapePercent
    local skinMix = headBlend.ParentSkinTonePercent
    SetLbgCharacterProp("mom", momID)
    SetLbgCharacterProp("dad", dadID)
    SetLbgCharacterProp("resemblance", shapeMix)
    SetLbgCharacterProp("skintone", skinMix)

    -- Copy vMenu PedAppearance
    local appearance = character.PedAppearance
    SetLbgCharacterProp("hair", appearance.hairStyle)
    SetLbgCharacterProp("hair_color_1", appearance.hairColor)
    -- TODO: hair highlights colour?

    SetLbgCharacterProp("eyebrows", appearance.eyebrowsStyle)
    SetLbgCharacterProp("eyebrows_2", appearance.eyebrowsOpacity)
    SetLbgCharacterProp("eyebrows_3", appearance.eyebrowsColor)

    SetLbgCharacterProp("age_1", appearance.ageingStyle)
    SetLbgCharacterProp("age_2", appearance.ageingOpacity)

    SetLbgCharacterProp("complexion_1", appearance.complexionStyle)
    SetLbgCharacterProp("complexion_2", appearance.complexionOpacity)

    SetLbgCharacterProp("makeup_1", appearance.makeupStyle)
    SetLbgCharacterProp("makeup_2", appearance.makeupOpacity)
    SetLbgCharacterProp("makeup_3", appearance.makeupColor)

    SetLbgCharacterProp("lipstick_1", appearance.lipstickStyle)
    SetLbgCharacterProp("lipstick_2", appearance.lipstickOpacity)
    SetLbgCharacterProp("lipstick_3", appearance.lipstickColor)

    SetLbgCharacterProp("blush_1", appearance.blushStyle)
    SetLbgCharacterProp("blush_2", appearance.blushOpacity)
    SetLbgCharacterProp("blush_3", appearance.blushColor)

    SetLbgCharacterProp("beard", appearance.beardStyle)
    SetLbgCharacterProp("beard_2", appearance.beardOpacity)
    SetLbgCharacterProp("beard_3", appearance.beardColor)

    SetLbgCharacterProp("moles_1", appearance.molesFrecklesStyle)
    SetLbgCharacterProp("moles_2", appearance.molesFrecklesOpacity)

    SetLbgCharacterProp("eye_color", appearance.eyeColor)

    -- Copy vMenu FaceShapeFeatures
    local faceShapeFeatures = character.FaceShapeFeatures.features

    SetLbgCharacterProp("neck_thick", faceShapeFeatures["19"])
    SetLbgCharacterProp("chin_hole", faceShapeFeatures["18"])
    SetLbgCharacterProp("chin_width", faceShapeFeatures["17"])
    SetLbgCharacterProp("chin_length", faceShapeFeatures["16"])
    SetLbgCharacterProp("chin_height", faceShapeFeatures["15"])
    SetLbgCharacterProp("jaw_2", faceShapeFeatures["14"])
    SetLbgCharacterProp("jaw_1", faceShapeFeatures["13"])
    SetLbgCharacterProp("lips_thick", faceShapeFeatures["12"])
    SetLbgCharacterProp("eye_open", faceShapeFeatures["11"])
    SetLbgCharacterProp("cheeks_3", faceShapeFeatures["10"])
    SetLbgCharacterProp("cheeks_2", faceShapeFeatures["9"])
    SetLbgCharacterProp("cheeks_1", faceShapeFeatures["8"])
    SetLbgCharacterProp("eyebrows_6", faceShapeFeatures["6"])
    SetLbgCharacterProp("eyebrows_5", faceShapeFeatures["7"])
    SetLbgCharacterProp("nose_6", faceShapeFeatures["5"])
    SetLbgCharacterProp("nose_5", faceShapeFeatures["4"])
    SetLbgCharacterProp("nose_4", faceShapeFeatures["3"])
    SetLbgCharacterProp("nose_3", faceShapeFeatures["2"])
    SetLbgCharacterProp("nose_2", faceShapeFeatures["1"])
    SetLbgCharacterProp("nose_1", faceShapeFeatures["0"])

    -- Set default outfit
    -- TODO: add vMenu clothing import
    SetLbgCharacterProp("outfit", 1)

    RefreshModel()
end

function AddvMenuCharacterList()
    local characters = LoadvMenuCharacters()

    local submenu
    if characters ~= {} then
        submenu = _menuPool:AddSubMenu(mainMenu, "Import from vMenu",
            "Import multiplayer character data created using vMenu.", true, true)
    end

    local charMenuItemMap = {}

    local count = 0

    if submenu then
        for charName, charData in pairs(characters) do
            print(charName)
            local menuItem = NativeUI.CreateItem(charName, "Import this character")
            submenu:AddItem(menuItem)

            count = count + 1
            charMenuItemMap[count] = charName
        end

        submenu.OnItemSelect = function(sender, item, index)
            local charName = charMenuItemMap[index]

            if charName ~= "" and charName ~= nil then
                print(characters[charName])
                ApplyvMenuCharacter(characters[charName])
            end
        end
    end
end

AddvMenuCharacterList()
