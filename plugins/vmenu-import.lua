function LoadvMenuCharacters()
    local mpCharHandle = StartFindExternalKvp("vMenu", "mp_ped_")
    local mpCharTable = {}

    if mpCharHandle ~= -1 then
        local key
        local count = 1

        repeat
            key = FindKvp(mpCharHandle)

            if key then
                local charJson = GetExternalKvpString("vMenu", key)
                local charParsed = json.decode(charJson)
                local charName = string.gsub(charParsed.SaveName, "mp_ped_", "", 1)
                print(charJson)

                count = count + 1
                mpCharTable[charName] = charParsed
            end
        until key == nil or key == ""
    end

    EndFindKvp(mpCharHandle)

    return mpCharTable
end
