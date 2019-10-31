import React from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";
import Animated from "../react-ui-basics/Animated";
import Button from "../react-ui-basics/Button";

export default {
    title: 'Animated',
    component: Animated,
};


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

export const story1 = () => <div>
    <AnimatedHolder/>
</div>;
story1.story = {
    name: 'basic',
};
