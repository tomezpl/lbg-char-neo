type MaybeArray<T> = T | Array<T> | ReadonlyArray<T>;

export function ensureArray<TElement = unknown, T extends MaybeArray<TElement> = MaybeArray<TElement>>(data: T): T extends ReadonlyArray<TElement> ? ReadonlyArray<TElement> : Array<TElement> {
    if (typeof data !== 'undefined') {
        if (Array.isArray(data)) {
            return data;
        }

        return [data as TElement];
    }

    return [];
}

/**
 * Returns an array of values from zero to one with 0.1 intervals
 */
export function getZtO(): [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] {
    return [...Array(11)].map((_, i) => i / 10) as ReturnType<typeof getZtO>;
}

export function getZtOIndex(value: number): 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 {
    return ((value % 0.1) / 0.1) as ReturnType<typeof getZtOIndex>;
}