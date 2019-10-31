import React from 'react';
import "./index.css"
import TextField from "../react-ui-basics/TextField";

export default {
    title: 'TextField',
    component: TextField,
};

export const story1 = () => <React.Fragment>
    <TextField/>
    <br/>
    <br/>
    <TextField label={"TextField"}/>
    <br/>
    <br/>
    <TextField label={"TextField disabled"} disabled={true}/>
    <br/>
    <br/>
    <TextField label={"TextField with placeholder"} placeholder={'placeholder'}/>
    <br/>
    <br/>
    <TextField label={"TextField required"} className={'errored'} required={true}/>
    <br/>
    <br/>
    <TextField label={"TextField required with error text"} required={true} className={'errored'} error={'error message'}/>
    <br/>
    <br/>
    <TextField label={"TextField required with check"} required={true} type={'password'} check={value => value.length < 8 && 'Min 8 chars'}/>
</React.Fragment>;
story1.story = {
    name: 'basic',
};
