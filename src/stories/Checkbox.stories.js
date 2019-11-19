import React from 'react';
import "./index.css"
import Checkbox from "../react-ui-basics/Checkbox";

export default {
    title: 'Checkbox',
    component: Checkbox,
};

export const story1 = () => <React.Fragment>
    <Checkbox/>
    <br/>
    <Checkbox label={'With label'}/>
    <br/>
    <Checkbox label={'With label'} disabled={true}/>
    <br/>
    <Checkbox label={'With label'} disabled={true} value={true}/>
</React.Fragment>;
story1.story = {
    name: 'basic',
};
