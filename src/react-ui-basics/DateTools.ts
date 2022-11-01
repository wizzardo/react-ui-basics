export const resetTime = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date
};
export const timeOf = (date: Date) => date.getTime();
export const equals = (a: Date, b: Date) => (a === b) || (a && b && timeOf(a) === timeOf(b));
export const isBefore = (a: Date, b: Date) => a && b && timeOf(a) < timeOf(b);
export const isAfter = (a: Date, b: Date) => a && b && timeOf(a) > timeOf(b);
export const max = (a: Date, b: Date) => {
    if (!b) return a;
    if (!a) return b;
    return timeOf(a) > timeOf(b) ? a : b;
};
export const min = (a: Date, b: Date) => {
    if (!b) return a;
    if (!a) return b;
    return timeOf(a) < timeOf(b) ? a : b;
};

export class TimeUnit {
    static MILLISECOND = new TimeUnit('Milliseconds');
    static SECOND = new TimeUnit('Seconds');
    static MINUTE = new TimeUnit('Minutes');
    static HOUR = new TimeUnit('Hours');
    static DAY = new TimeUnit('Date');
    static MONTH = new TimeUnit('Month');
    static YEAR = new TimeUnit('FullYear');
    set: (date: Date, value: number) => void;
    get: (date: Date) => number;

    constructor(field) {
        const getter = 'get' + field;
        const setter = 'set' + field;
        // this.getter = getter;
        // this.setter = setter;
        this.toString = () => field;
        this.get = (date) => date[getter]();
        this.set = (date, value) => date[setter](value);
    }

}

export const get = (date: Date, timeUnit: TimeUnit) => timeUnit.get(date);
export const set = (date: Date, value: number, timeUnit: TimeUnit): Date => {
    timeUnit.set(date, value);
    return date;
};

export const add = (date: Date, amount: number, timeUnit: TimeUnit): Date => {
    timeUnit.set(date, timeUnit.get(date) + amount);
    return date;
};

export const subtract = (date: Date, amount: number, timeUnit: TimeUnit): Date => add(date, -amount, timeUnit);

export interface DateExtended extends Date {
    get: (timeUnit: TimeUnit) => number;
    set: (value: number, timeUnit: TimeUnit) => DateExtended;
    add: (amount: number, timeUnit: TimeUnit) => DateExtended;
    subtract: (amount: number, timeUnit: TimeUnit) => DateExtended;
    isBefore: (after: Date) => boolean;
    isAfter: (before: Date) => boolean;
    isSameDate: (another: Date) => boolean;
    equals: (another: Date) => boolean;
    resetTime: () => DateExtended;
}

export const extend = (date:Date):DateExtended => {
    const d = date as DateExtended
    d.get = (timeUnit) => get(date, timeUnit);
    d.set = (value, timeUnit) => set(date, value, timeUnit) as DateExtended;
    d.add = (amount, timeUnit) => add(date, amount, timeUnit) as DateExtended;
    d.subtract = (amount, timeUnit) => subtract(date, amount, timeUnit) as DateExtended;
    d.isBefore = (after) => isBefore(date, after);
    d.isAfter = (before) => isAfter(date, before);
    d.isSameDate = (another) => isSameDay(date, another);
    d.equals = (another) => equals(date, another);
    d.resetTime = () => resetTime(date) as DateExtended;
    return d;
};
export const dateOf = (date?: string | Date): DateExtended => extend(date ? new Date(date) : new Date());
export const now = dateOf;
export const copy = dateOf;

export const isSameDay = (dateA: Date, dateB: Date) => dateA.getDate() === dateB.getDate() && dateA.getMonth() === dateB.getMonth() && dateA.getFullYear() === dateB.getFullYear();