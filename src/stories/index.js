import React from 'react';
import "./index.css"

import {storiesOf} from '@storybook/react';

import Snackbar from "../react-ui-basics/Snackbar";
import Button from "../react-ui-basics/Button";
import TextField from "../react-ui-basics/TextField";
import Checkbox from "../react-ui-basics/Checkbox";
import Switch from "../react-ui-basics/Switch";
import Dialog from "../react-ui-basics/Dialog";
import AutocompleteSelect from "../react-ui-basics/AutocompleteSelect";
import {SCROLLBAR_MODE_HIDDEN} from "../react-ui-basics/Scrollable";


storiesOf('Button', module)
    .add('basic', () => <React.Fragment>
        <Button>Button</Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button className={'green'}>GREEN</Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button className={'blue'}>blue</Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button className={'black'}>black</Button>
        <br/>
        <br/>
        <Button raised={false}>Not raised Button</Button>
        <br/>
        <br/>
        <Button flat={true}>Flat button</Button>
        <br/>
        <br/>
        <Button raised={false}>
            <i className="material-icons">favorite</i>
            with icon
        </Button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Button className="blue">
            <i className="material-icons">favorite</i>
            with icon
        </Button>
        <br/>
        <br/>
        <Button raised={false} round={true}>
            <i className="material-icons">favorite</i>
        </Button>
    </React.Fragment>)
;

let snackbar;
storiesOf('Snackbar', module)
    .add('basic', () => <Snackbar className="shown" text={"Message sent"}/>)
    .add('animation', () => <React.Fragment>
        <Snackbar ref={it => snackbar = it}/>
        <Button onClick={() => snackbar.show("Message sent")}>Show snackbar!</Button>
    </React.Fragment>)
;


storiesOf('TextField', module)
    .add('basic', () => <React.Fragment>
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
        <TextField label={"TextField required with check"} required={true} type={'password'} error={'Min 8 chars'} check={value => value.length >= 8}/>
    </React.Fragment>)
;

storiesOf('Checkbox', module)
    .add('basic', () => <React.Fragment>
        <Checkbox/>
        <br/>
        <Checkbox label={'With label'}/>
    </React.Fragment>)
;

storiesOf('Switch', module)
    .add('basic', () => <React.Fragment>
        <Switch/>
        <br/>
        <Switch label={'With label'}/>
        <br/>
        <Switch labelOn={'On'} labelOff={'Off'}/>
        <br/>
        <Switch label={'Switch'} labelOn={'On'} labelOff={'Off'}/>
        <br/>
    </React.Fragment>)
;

storiesOf('Dialog', module)
    .add('basic', () => <Dialog
        show={true}
        title={'Get this party started?'}
        description={'Turn up the jams and have a good time.'}
    />)
;


const MenuIcon = () => <Button flat={true} round={true}>
    <i className="material-icons">more_vert</i>
</Button>;

storiesOf('Select', module)
// .add('basic autocomplete', () => <AutocompleteSelect data={['one', 'two', 'three']}/>)
// .add('basic', () => <AutocompleteSelect data={['one', 'two', 'three']}/>)
    .add('menu', () => <AutocompleteSelect className="menu"
                                           scroll={SCROLLBAR_MODE_HIDDEN}
                                           value={true}
                                           withArrow={false}
                                           selectedComponent={MenuIcon}
                                           withFilter={false}
                                           selectedMode={'inline'}
                                           data={[
                                               'edit',
                                               'delete',
                                           ]}
                                           labels={{
                                               'edit': <div className={"row"}><i className="material-icons">edit</i>
                                                   Edit
                                               </div>,
                                               'delete': <div className={"row"}><i className="material-icons">delete_outline</i>
                                                   Delete
                                               </div>,
                                           }}
    />)
;
