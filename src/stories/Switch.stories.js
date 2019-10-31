import React from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";

export default {
    title: 'Switch',
    component: Switch,
};

export const story1 = () => <React.Fragment>
    <Switch/>
    <br/>
    <Switch label={'With label'}/>
    <br/>
    <Switch labelOn={'On'} labelOff={'Off'}/>
    <br/>
    <Switch label={'Switch'} labelOn={'On'} labelOff={'Off'}/>
    <br/>
</React.Fragment>;
story1.story = {
    name: 'basic',
};
