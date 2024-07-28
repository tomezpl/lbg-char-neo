type MaybeArray<T> = T | Array<T> | ReadonlyArray<T>;

export function ensureArray<TElement = unknown, T extends MaybeArray<TElement> = MaybeArray<TElement>>(data: T): T extends ReadonlyArray<TElement> ? ReadonlyArray<TElement> : Array<TElement> {
    if(typeof data !== 'undefined') {
        if(Array.isArray(data)) {
            return data;
        }

        return [data as TElement];
    }

    return [];
}