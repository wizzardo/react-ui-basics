import React from 'react';
import "./index.css"
import Button from "../react-ui-basics/Button";
import FloatingActionButton from "../react-ui-basics/FloatingActionButton";

export default {
    title: 'Button',
    component: Button,
};

export const story1 = () => <React.Fragment>
    <Button>Button</Button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <Button className={'green'}>GREEN</Button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <Button className={'blue'}>blue</Button>
    &nbsp;&nbsp;&nbsp;&nbsp;
    <Button className={'red'}>red</Button>
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
</React.Fragment>;
story1.story = {
    name: 'All buttons',
};


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

export const story2 = () => <React.Fragment>
    <FABContainer/>
    <FABContainer mini={true} icon={'create'} className={'fab-right-96'}/>
</React.Fragment>;

story2.story = {name: 'floating action button'};


export const knobs = (args) => (
    <Button {...args}>{args.label}</Button>
);

knobs.args = {
    color: ['green', 'blue', 'red', 'black', 'gray'],
    raised: true,
    round: false,
    flat: false,
    disabled: false,
    label: 'Button',
};

knobs.argTypes = {
    color: {
        control: {
            type: 'select',
        },
    },
};
knobs.story = {name: 'knobs'};