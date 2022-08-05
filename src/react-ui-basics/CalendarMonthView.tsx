import React from 'react';
import './CalendarMonthView.css'
import * as DateTools from "./DateTools";
import {classNames} from "./Tools";
import {DateExtended} from "./DateTools";

const daysOfWeek = [1, 2, 3, 4, 5, 6, 0];
const rows = [1, 2, 3, 4, 5, 6];
const TimeUnit = DateTools.TimeUnit;

const defaultDayRenderer = (day) => <span className={'value'}>
                            {DateTools.get(day, DateTools.TimeUnit.DAY)}
                        </span>;

interface CalendarMonthViewProps {
    className?: string,
    dayOfWeekToString: (day: number) => string | JSX.Element,
    dayRenderer: (day: DateExtended, defaultRenderer: (day: DateExtended) => JSX.Element, row: number, column: number) => string | JSX.Element,
    selectedDate?: Date,
    monthOf?: Date,
}

const CalendarMonthView = ({className, dayOfWeekToString, selectedDate, monthOf, dayRenderer}: CalendarMonthViewProps) => {
    const today = DateTools.now();

    const currentDay = today.get(TimeUnit.DAY);
    const currentMonth = today.get(TimeUnit.MONTH);
    const currentYear = today.get(TimeUnit.YEAR);

    const selected = selectedDate && DateTools.dateOf(selectedDate);

    const selectedDay = selected && selected.get(TimeUnit.DAY);
    const selectedMonth = selected && selected.get(TimeUnit.MONTH);
    const selectedYear = selected && selected.get(TimeUnit.YEAR);

    const showMonth = DateTools.dateOf(monthOf).get(TimeUnit.MONTH);

    const startOfMonth = DateTools.dateOf(monthOf || today);
    startOfMonth.subtract(startOfMonth.get(TimeUnit.DAY) - 1, TimeUnit.DAY);

    let shiftToStart;
    if (startOfMonth.getDay() === 0) {
        shiftToStart = 6;
    } else if (startOfMonth.getDay() === 1) {
        shiftToStart = 7;
    } else {
        shiftToStart = startOfMonth.getDay() - 1;
    }
    const theDay = DateTools.dateOf(startOfMonth).subtract(shiftToStart, TimeUnit.DAY).resetTime();

    return <div className={classNames('CalendarMonthView', className)}>
        <div className={'headers row'}>
            {daysOfWeek.map(i => <div key={i} className={classNames('header',
                (i === 6 || i === 0) && 'weekend'
            )}>{dayOfWeekToString(i)}</div>)}
        </div>
        {rows.map((_, row) => <div key={row} className={'days row'}>
            {daysOfWeek.map((_, cell) => {
                const day = DateTools.get(theDay, DateTools.TimeUnit.DAY);
                const month = DateTools.get(theDay, DateTools.TimeUnit.MONTH);
                const year = DateTools.get(theDay, DateTools.TimeUnit.YEAR);
                const dayOfWeek = theDay.getDay();

                const rendered = <div key={(cell + 1) * (row + 1)} className={classNames('day',
                    month !== showMonth && 'notSelectedMonth',
                    day === currentDay && month === currentMonth && year === currentYear && 'today',
                    day === selectedDay && month === selectedMonth && year === selectedYear && 'selected',
                    (dayOfWeek === 6 || dayOfWeek === 0) && 'weekend'
                )}>
                    {!dayRenderer && defaultDayRenderer(theDay)}
                    {dayRenderer && dayRenderer(theDay, defaultDayRenderer, row, cell)}
                </div>;

                theDay.add(1, DateTools.TimeUnit.DAY);
                return rendered;
            })}
        </div>)}
    </div>
};
export default CalendarMonthView