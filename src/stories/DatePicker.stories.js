import React, {useState} from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";
import Animated from "../react-ui-basics/Animated";
import Button from "../react-ui-basics/Button";
import DatePicker from "../react-ui-basics/DatePicker";

export default {
    title: 'DatePicker',
    component: DatePicker,
};


export const story1 = () => {
    const [date, setDate]=useState(null)

    return <div>
        <DatePicker
            value={date}
            dayOfWeekToString={day => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
            monthToString={month => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month]}
            parser={(date) => new Date(date)}
            formatter={date => date.toISOString()}
            onChange={e => setDate(e.target.value)}
        />
    </div>;
};
story1.story = {
    name: 'basic',
};
