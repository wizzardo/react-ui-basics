import React from 'react';
import './DatePicker.css'
import TextField from "./TextField";
import * as DateTools from "./DateTools";
import {orNoop, classNames, preventDefault} from "./Tools";
import Button from './Button'
import CalendarMonthView from "./CalendarMonthView";
import MaterialIcon from "./MaterialIcon";
import {DateExtended} from "./DateTools";

const DayRenderer = ({day, selected, minDate, onClick}: {
    day: DateExtended,
    selected: Date,
    minDate: Date,
    onClick: (day: Date) => void
}) =>
    <span
        className={classNames('value',
            minDate && (day.isBefore(minDate) && !day.isSameDate(minDate)) && 'inactive',
            selected && day.isSameDate(selected) && 'selected',
        )}
        onClick={e => {
            preventDefault(e);
            if (minDate && (day.isBefore(minDate) && !day.isSameDate(minDate))) return;

            onClick(day);
        }}
    >
        {DateTools.get(day, DateTools.TimeUnit.DAY)}
    </span>;

export interface DatePickerProps {
    id?: number | string
    name?: string
    open?: boolean
    onClose?: () => void
    renderInput?: () => JSX.Element
    value: Date
    minDate?: Date
    formatter: (date: Date) => string
    parser: (input: string) => Date
    onChange: (e) => void
    dayOfWeekToString: (day: number) => string | JSX.Element
    monthToString: (day: number) => string | JSX.Element
}

interface DatePickerState {
    focused: boolean,
    value: Date,
    selectedMonth: DateExtended,
    text: string,
}

class DatePicker extends React.Component<DatePickerProps, DatePickerState> {
    private el: HTMLDivElement;
    private listener: (e) => void;

    constructor(props: DatePickerProps) {
        super(props);
        const value = props.value;
        this.state = {
            focused: !!props.open,
            value,
            text: props.formatter(value),
            selectedMonth: DateTools.dateOf(value || new Date()).resetTime().set(1, DateTools.TimeUnit.DAY),
        };
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.value !== prevProps.value) {
            const value = this.props.value
            this.setState({
                value,
                selectedMonth: DateTools.dateOf(value || new Date()).resetTime().set(1, DateTools.TimeUnit.DAY),
                text: this.props.formatter(value)
            })
        }
        if (this.props.open !== prevProps.open) {
            const open = !!this.props.open
            this.setState({
                focused: open
            })
        }
        if (!this.state.focused && !!prevState.focused) {
            orNoop(this.props.onClose)()
        }
    };

    componentDidMount() {
        document.addEventListener('mousedown', this.listener = (e) => {
            if (this.state.focused && !this.el.contains(e.target))
                this.setState({focused: false});
        })
    };

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.listener)
    };

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (!DateTools.equals(this.props.value, nextProps.value))
            return true;

        if (!DateTools.equals(this.state.value, nextState.value))
            return true;

        if (this.props.open !== nextProps.open)
            return true;

        if (this.state.text !== nextState.text)
            return true;

        if (this.state.focused !== nextState.focused)
            return true;

        if (this.state.selectedMonth !== nextState.selectedMonth)
            return true;

        if (!DateTools.equals(this.props.minDate, nextProps.minDate))
            return true;

        return false;
    };

    render() {
        const {minDate, formatter, parser, dayOfWeekToString, monthToString, renderInput} = this.props;
        const {value, text, focused, selectedMonth} = this.state;

        return <div className={`DatePicker`} ref={el => this.el = el}>
            {!!renderInput && renderInput()}
            {!renderInput && <TextField id={'value'} value={text}
                                        autoComplete="off"
                                        onFocus={() => this.setState({focused: true})}
                                        onChange={e => {
                                            const text = e.target.value;
                                            try {
                                                const date = parser(text);
                                                if (date && date instanceof Date && !Number.isNaN(date.getTime())) {
                                                    if (!value || !DateTools.equals(value, date))
                                                        this.onChange(date);
                                                }
                                                this.setState({text})
                                            } catch (ignored) {
                                            }
                                        }}
                                        onKeyDown={e => {
                                            if ((e.keyCode === 27/*esc*/ || e.keyCode === 13/*enter*/) && focused) {
                                                e.preventDefault();
                                                this.setState({text: formatter(value), focused: false});
                                            }
                                        }}
            />}
            <div className={`calendar ${focused && 'focused'}`}>
                <div className={'row monthSelect'}>
                    <span>
                        {monthToString(selectedMonth.get(DateTools.TimeUnit.MONTH))}
                        &nbsp;{selectedMonth.get(DateTools.TimeUnit.YEAR)}
                    </span>
                    <Button flat={true} round={true} disabled={minDate && DateTools.dateOf(selectedMonth).isBefore(minDate)} onClick={() => {
                        this.setState({selectedMonth: DateTools.dateOf(selectedMonth).subtract(1, DateTools.TimeUnit.MONTH)})
                    }}>
                        <MaterialIcon icon={'chevron_left'}/>
                    </Button>
                    <Button flat={true} round={true} onClick={() => {
                        this.setState({selectedMonth: DateTools.dateOf(selectedMonth).add(1, DateTools.TimeUnit.MONTH)})
                    }}>
                        <MaterialIcon icon={'chevron_right'}/>
                    </Button>
                </div>
                <CalendarMonthView monthOf={selectedMonth}
                                   dayOfWeekToString={dayOfWeekToString}
                                   dayRenderer={(date) => <DayRenderer
                                       day={DateTools.dateOf(date)}
                                       selected={value}
                                       minDate={minDate}
                                       onClick={value => {
                                           this.onChange(value)
                                           this.setState({focused: false, text: formatter(value)});
                                       }}
                                   />}/>
            </div>
        </div>
    };

    onChange = (value: Date) => {
        this.setState({value});
        orNoop(this.props.onChange)({
            target: {
                id: this.props.id,
                name: this.props.name,
                value,
            }
        })
    }
}

export default DatePicker;
