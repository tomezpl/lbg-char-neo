/** Hides all other players' peds and disables their collision for the current frame. */
export function hidePeds() {
    for (let i = 0; i < 48; i++) {
        if (i !== PlayerId() && IsPlayerPlaying(i)) {
            const otherPed = GetPlayerPed(i);
            SetEntityNoCollisionEntity(PlayerPedId(), otherPed, true);
            SetEntityLocallyInvisible(otherPed);
        }
    }
}