export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve();

            if(timeout) {
                clearTimeout(timeout);
            }
        }, ms);
    });
}