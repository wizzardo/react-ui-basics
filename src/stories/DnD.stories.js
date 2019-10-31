import React from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";
import DNDContainer from "../react-ui-basics/DNDContainer";
import DNDDroppable from "../react-ui-basics/DNDDroppable";
import DNDDraggable from "../react-ui-basics/DNDDraggable";

export default {
    title: 'Drag&Drop',
    component: DNDContainer,
};

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

export const story1 = () => <div>
    <DNDExample/>
</div>;
story1.story = {
    name: 'basic',
};
