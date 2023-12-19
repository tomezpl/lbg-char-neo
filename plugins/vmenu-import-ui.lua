function ApplyvMenuCharacter(character)
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

    local appearance = character.PedAppearance
    SetLbgCharacterProp("hair", appearance.hairStyle)
    SetLbgCharacterProp("hair_color_1", appearance.hairColor)
    -- TODO: hair highlights colour?

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
