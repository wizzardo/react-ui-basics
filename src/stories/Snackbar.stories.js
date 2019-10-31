import React from 'react';
import "./index.css"
import Button from "../react-ui-basics/Button";
import Snackbar from "../react-ui-basics/Snackbar";

export default {
    title: 'Snackbar',
    component: Snackbar,
};

export const story1 = () => <Snackbar className="shown" text={"Message sent"}/>;
story1.story = {
    name: 'basic',
};


let snackbar;
export const story2 = () => <React.Fragment>
    <Snackbar ref={it => snackbar = it}/>
    <Button onClick={() => snackbar.show("Message sent")}>Show snackbar!</Button>
</React.Fragment>;
story2.story = {name: 'animation'};
