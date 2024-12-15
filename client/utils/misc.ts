/**
 * Returns an array of values from zero to one with 0.1 intervals
 */
export function getZtO(): [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] {
    return [...Array<number>(11)].map((_, i) => i / 10) as ReturnType<typeof getZtO>;
}

/**
 * Returns the index of a 0.1 interval between 0 and 1 as an integer (0,10).
 * @param value 
 * @returns 
 */
export function getZtOIndex(value: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
    return ((value % 0.1) / 0.1) as ReturnType<typeof getZtOIndex>;
}