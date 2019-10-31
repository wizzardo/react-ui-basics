import React from 'react';
import "./index.css"
import Button from "../react-ui-basics/Button";
import {ReadyListener} from "../react-ui-basics";

export default {
    title: 'ReadyListener',
    component: ReadyListener,
};


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

export const story1 = () => <>
    <ReadyListenerExample count={3}/>

    <br/>
    <br/>
    and an another
    <ReadyListenerExample count={2} render={ready => `is ready: ${ready}`}/>

    <br/>
    <br/>
    and a ready one
    <ReadyListenerExample count={0} render={ready => `is ready: ${ready}`}/>
</>;
story1.story = {
    name: 'basic',
};
