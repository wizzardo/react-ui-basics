import React from 'react';
import "./index.css"
import Switch from "../react-ui-basics/Switch";
import DNDContainer from "../react-ui-basics/DNDContainer";
import DNDDroppable from "../react-ui-basics/DNDDroppable";
import DNDDraggable from "../react-ui-basics/DNDDraggable";
import DroppableList from "../react-ui-basics/DroppableList";
import {orNoop} from "../react-ui-basics/Tools";
import DroppableHorizontalList from "../react-ui-basics/DroppableHorizontalList";

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


class DNDExample2 extends React.Component {

    state = {
        list: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    };

    render() {
        const {
            draggableInitializer,
            droppableInitializer,
            draggableEnhancer,
            list,
        } = this.state;

        return (
            <DNDContainer className="example-list"
                          provideDraggableInitializer={draggableInitializer => this.setState({draggableInitializer})}
                          provideDroppableInitializer={droppableInitializer => this.setState({droppableInitializer})}
            >
                <DroppableList className={'column'}
                               provideDraggableEnhancer={draggableEnhancer => this.setState({draggableEnhancer})}
                               initializer={droppableInitializer} onDrop={(data, o, n) => {
                    let list = [...this.state.list];
                    console.log('new list', list)
                    list.splice(o, 1);
                    console.log('new list', list)
                    list.splice(n, 0, data.id);
                    console.log('new list', list)
                    this.setState({list})
                }}>
                    {list.map(id => <DNDDraggable id={id} key={id} data={{id}}
                                                  copy={(initializer, __, it) => initializer(it)}
                                                  initializer={orNoop(draggableEnhancer)(draggableInitializer) || draggableInitializer}>
                        {`Draggable ${id}`}
                    </DNDDraggable>)}
                </DroppableList>
            </DNDContainer>
        );
    }
}

export const story2 = () => <div>
    <DNDExample2/>
</div>;
story2.story = {
    name: 'dnd list',
};

class DNDExample3 extends React.Component {

    state = {
        list: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        colors: [
            '#f44336',
            '#E91E63',
            '#9C27B0',
            '#673AB7',
            '#3F51B5',
            '#2196F3',
            '#03A9F4',
            '#00BCD4',
            '#009688',
            '#4CAF50',
            '#8BC34A',
            '#CDDC39',
            '#FFEB3B',
            '#FFC107',
            '#FF9800',
            '#FF5722',
            '#795548',
            '#9E9E9E',
            '#607D8B',
        ]
    };

    render() {
        const {
            draggableInitializer,
            droppableInitializer,
            draggableEnhancer,
            list,
            colors,
        } = this.state;

        return (

            <DNDContainer className="example-list"
                          provideDraggableInitializer={draggableInitializer => this.setState({draggableInitializer})}
                          provideDroppableInitializer={droppableInitializer => this.setState({droppableInitializer})}
            >
                <DroppableHorizontalList className={'row'}
                                         provideDraggableEnhancer={draggableEnhancer => this.setState({draggableEnhancer})}
                                         initializer={droppableInitializer} onDrop={(data, o, n) => {

                    let list = [...this.state.list];
                    console.log('new list', list)
                    list.splice(o, 1);
                    console.log('new list', list)
                    list.splice(n, 0, data.id);
                    console.log('new list', list)
                    this.setState({list})
                }}>
                    {list.map(id => <DNDDraggable id={id} key={id} data={{id}}
                                                  copy={(initializer, __, it) => initializer(it)}
                                                  initializer={orNoop(draggableEnhancer)(draggableInitializer) || draggableInitializer}>
                        <div style={{backgroundColor: colors[id], width: '50px', height: '50px'}}/>
                    </DNDDraggable>)}
                </DroppableHorizontalList>
            </DNDContainer>
        );
    }
}

export const story3 = () => <div>
    <DNDExample3/>
</div>;
story3.story = {
    name: 'dnd horizontal list',
};
