import React from 'react';
import "./index.css"
import Dialog from "../react-ui-basics/Dialog";

export default {
    title: 'Dialog',
    component: Dialog,
};

export const story1 = () => <Dialog
    show={true}
    title={'Get this party started?'}
    description={'Turn up the jams and have a good time.'}
/>;
story1.story = {
    name: 'basic',
};
