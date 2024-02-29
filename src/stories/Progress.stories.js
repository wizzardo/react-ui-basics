import React from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";
import CircleProgress from "../react-ui-basics/CircleProgress";
import SpinningProgress from "../react-ui-basics/SpinningProgress";
import FormUploadProgress from "../react-ui-basics/FormUploadProgress";

export default {
    title: 'Progress',
    component: CircleProgress,
};

export const story1 = () => <div>
    <CircleProgress value={0}/>
    <CircleProgress value={8}/>
    <CircleProgress value={20}/>
    <CircleProgress value={30}/>
    <CircleProgress value={40}/>
    <CircleProgress value={50}/>
    <CircleProgress value={60}/>
    <CircleProgress value={70}/>
    <CircleProgress value={80}/>
    <CircleProgress value={90}/>
    <CircleProgress value={100}/>
</div>;
story1.story = {
    name: 'circle',
};

export const story2 = () => <div>
    <SpinningProgress/>
</div>;
story2.story = {
    name: 'spinner',
};


export const story3 = () => <FormUploadProgress processingLabel={'Processing..'}
                                                cancelLabel={'Cancel'}
                                                value={75} loaded={74 * 1024 * 1024}
                                                total={98 * 1024 * 1024}
                                                cancel={() => console.log('canceled')}
/>;
story3.story = {
    name: 'form upload',
};



export const story4 = () => <FormUploadProgress loaded={100} total={100} processingLabel={'Processing..'} cancelLabel={'Cancel'} value={100} cancel={() => console.log('canceled')}/>;
story4.story = {
    name: 'form upload. processing',
};
