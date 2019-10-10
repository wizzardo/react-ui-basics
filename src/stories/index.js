import React from 'react';
import "./index.css"

import {storiesOf} from '@storybook/react';

import Snackbar from "../react-ui-basics/Snackbar";
import Button from "../react-ui-basics/Button";
import TextField from "../react-ui-basics/TextField";
import Checkbox from "../react-ui-basics/Checkbox";
import Switch from "../react-ui-basics/Switch";
import Dialog from "../react-ui-basics/Dialog";
import AutocompleteSelect, {MODE_MULTIPLE_AUTO} from "../react-ui-basics/AutocompleteSelect";
import {SCROLLBAR_MODE_HIDDEN} from "../react-ui-basics/Scrollable";
import FloatingActionButton from "../react-ui-basics/FloatingActionButton";
import CircleProgress from "../react-ui-basics/CircleProgress";
import SpinningProgress from "../react-ui-basics/SpinningProgress";
import FormUploadProgress from "../react-ui-basics/FormUploadProgress";
import Animated from "../react-ui-basics/Animated";
import DNDContainer from "../react-ui-basics/DNDContainer";
import DNDDraggable from "../react-ui-basics/DNDDraggable";
import DNDDroppable from "../react-ui-basics/DNDDroppable";
import {ReadyListener} from "../react-ui-basics";

class FABContainer extends React.Component {
    state = {hidden: false};

    render() {
        const {hidden} = this.state;
        return <FloatingActionButton {...this.props} onClick={() => this.setState({hidden: !hidden})} hidden={hidden}/>
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.hidden)
            setTimeout(() => this.setState({hidden: false}), 1000)
    }
}

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
    .add('floating action button', () => <React.Fragment>
        <FABContainer/>
        <FABContainer mini={true} icon={'create'} className={'fab-right-96'}/>
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
        <TextField label={"TextField required with check"} required={true} type={'password'} check={value => value.length < 8 && 'Min 8 chars'}/>
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
    .add('basic autocomplete', () =>
        <AutocompleteSelect
            mode={MODE_MULTIPLE_AUTO}
            withArrow={false}
            label={"Select value"}
            data={[...Array(100)].map((_, i) => `value #${i}`)}
        />)
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


storiesOf('Progress', module)
    .add('circle', () => <div>
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
    </div>)
    .add('spinner', () => <div>
        <SpinningProgress/>
    </div>)
    .add('form upload', () => <FormUploadProgress processingLabel={'Processing..'}
                                                  cancelLabel={'Cancel'}
                                                  value={75} loaded={74 * 1024 * 1024}
                                                  total={98 * 1024 * 1024}
                                                  cancel={() => console.log('canceled')}
    />)
    .add('form upload. processing', () => <FormUploadProgress processingLabel={'Processing..'} cancelLabel={'Cancel'} value={100} cancel={() => console.log('canceled')}/>)
;

class AnimatedHolder extends React.Component {
    state = {
        show: false
    };

    render() {
        const {show} = this.state;
        return <div className={"AnimatedHolder"}>
            <Button style={{minWidth: '100px', marginRight: '20px'}} onClick={e => this.setState({show: !show})}>
                {show ? 'hide' : 'show'}
            </Button>
            <Animated mounting={1000} unmounting={1000} value={show}>
                <span>Animated</span>
            </Animated>
        </div>
    }
}

storiesOf('Animated', module)
    .add('basic', () => <div>
        <AnimatedHolder/>
    </div>)
;

class DNDExample extends React.Component {
    render() {
        const {
            draggableInitializer,
            droppableInitializer,
            basket1,
            basket2,
        } = this.state || {};
        return (<DNDContainer className="DNDExample"
                              provideDraggableInitializer={draggableInitializer => this.setState({draggableInitializer})}
                              provideDroppableInitializer={droppableInitializer => this.setState({droppableInitializer})}
            >
                {createDraggable('Draggable 1', draggableInitializer, {id: 1})}
                <br/>
                <br/>
                {createDraggable('Draggable 2', draggableInitializer, {id: 2})}
                <br/>
                <br/>
                {createDraggable('Draggable 3', draggableInitializer, {id: 3})}
                <br/>
                <br/>
                {createDraggable('Draggable 4', draggableInitializer, {id: 4})}
                <br/>
                <br/>
                {createDraggable('Draggable 5', draggableInitializer, {id: 5})}

                <DNDDroppable initializer={droppableInitializer} onDrop={data => this.setState({basket1: data})}>
                    Droppable, dropped: {JSON.stringify(basket1) || 'nothing'}
                </DNDDroppable>

                <DNDDroppable className={'second'} initializer={droppableInitializer} onDrop={data => this.setState({basket2: data})}>
                    Droppable, dropped: {JSON.stringify(basket2) || 'nothing'}
                </DNDDroppable>
            </DNDContainer>
        );
    }
}

const createDraggable = (label, initializer, data, className, key) => {
    return <DNDDraggable id={key} key={key} className={className} data={data} initializer={initializer}
                         copy={(initializer, className) => createDraggable(label, initializer, null, className)}>
        <div className="item">{label}</div>
    </DNDDraggable>;
};

storiesOf('Drag&Drop', module)
    .add('basic', () => <div>
        <DNDExample/>
    </div>)
;

class LoadableItem extends React.PureComponent {

    render() {
        const {NotReady} = this.props;
        const {loaded} = this.state || {};
        return <div>
            {!loaded && <NotReady/>}
            {!loaded && <Button onClick={() => this.setState({loaded: true})}>Load it!</Button>}
            {loaded && 'loaded!'}
        </div>
    }

}

class ReadyListenerExample extends React.PureComponent {
    constructor(props) {
        super(props);
        const [NotReadyIndicator, NotReady] = ReadyListener.createReadyListener()
        this.state = {
            NotReadyIndicator,
            NotReady,
        }
    }

    render() {
        const {
            NotReadyIndicator,
            NotReady,
        } = this.state;
        const {count, render} = this.props;
        return <div>
            <NotReadyIndicator render={render}>loading...</NotReadyIndicator>
            {/*<Indicator onChange={ready => console.log('ready', ready)}/>*/}
            {[...Array(count)].map((_, i) => <LoadableItem key={i} NotReady={NotReady}/>)}
        </div>
    }
}

storiesOf('ReadyListener', module)
    .add('basic', () => <>
        <ReadyListenerExample count={3}/>

        <br/>
        <br/>
        and an another
        <ReadyListenerExample count={2} render={ready => `is ready: ${ready}`}/>

        <br/>
        <br/>
        and a ready one
        <ReadyListenerExample count={0} render={ready => `is ready: ${ready}`}/>
    </>)
;