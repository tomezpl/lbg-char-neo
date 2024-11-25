const logPrefix = '[lbg-char-neo]';

export class Logger {
    public static log(...values: ReadonlyArray<unknown>) {
        console.log(logPrefix, 'INFO:', ...values);
    }

    public static warn(...values: ReadonlyArray<unknown>) {
        console.warn(logPrefix, 'WARN:', ...values);
    }

    public static error(...values: ReadonlyArray<unknown>) {
        console.error(logPrefix, 'ERR:', ...values);
    }
}