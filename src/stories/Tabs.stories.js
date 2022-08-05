import React, {useState} from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";
import Animated from "../react-ui-basics/Animated";
import Button from "../react-ui-basics/Button";
import DatePicker from "../react-ui-basics/DatePicker";
import Tabs from "../react-ui-basics/Tabs";

export default {
    title: 'Tabs',
    component: Tabs,
};


export const story1 = () => {
    const [date, setDate]=useState(null)

    return <div>
        <Tabs tabs={[
            {label: 'Tab 1', renderer: () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi tempor tellus vitae purus ornare rutrum. Sed mollis imperdiet eros, ut maximus tellus venenatis vitae. Aliquam ipsum odio, porta sed est ornare, tincidunt hendrerit mi. Phasellus a auctor elit, nec feugiat ipsum. Mauris turpis enim, venenatis ut quam sed, varius tincidunt quam. Mauris in erat ac urna tempus interdum vitae vitae ex. Duis nec egestas diam, sit amet sodales dui. Morbi bibendum lectus ac metus egestas blandit. Proin vitae ultricies nibh.'},
            {label: 'Tab 2', renderer: () => 'Morbi vitae nisl viverra, pulvinar dui ac, eleifend nisi. In blandit arcu a euismod consequat. Suspendisse pharetra eros quis blandit vehicula. Nunc vestibulum neque enim, placerat mollis odio venenatis ut. Aliquam in interdum magna. Maecenas varius, nibh ut porta tincidunt, augue tellus malesuada neque, quis pharetra est enim eu risus. Nullam sollicitudin, ligula id finibus condimentum, sapien dolor viverra nisl, et posuere mauris eros ac mi. Phasellus scelerisque, elit eget pellentesque interdum, justo risus lacinia tortor, sagittis efficitur ante nisl non elit. Vestibulum in quam nec magna vestibulum mattis a eu libero. In a lectus efficitur, feugiat diam eu, dictum ipsum. Pellentesque volutpat dignissim dictum.'},
            {label: 'Tab 3 (Big label!)', renderer: () => 'Fusce non justo mollis, consequat tellus eget, molestie tortor. Integer varius, nisl ac porta mattis, magna mauris luctus orci, sed egestas massa nibh quis tortor. In dapibus justo in ultricies placerat. In nisl libero, maximus id nunc eu, dictum aliquet ligula. Duis rhoncus risus sed orci lobortis, ut fermentum sem ullamcorper. Curabitur posuere quam magna, eu aliquet neque cursus et. Nam dictum leo eu risus eleifend aliquam nec vitae ligula. Nam eget vehicula leo. Suspendisse euismod mauris eget luctus aliquam. In vehicula augue ac sapien malesuada, vitae efficitur arcu auctor. Nulla gravida leo urna, id malesuada erat tristique quis. Proin sit amet ligula augue. Fusce cursus tempor ligula. Proin semper purus vitae aliquam dictum. Aliquam quis neque non magna fringilla porttitor.'},
        ]}
        />
    </div>;
};
story1.story = {
    name: 'basic',
};
