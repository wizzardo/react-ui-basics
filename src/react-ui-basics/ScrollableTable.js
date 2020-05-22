import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import Table from "./Table";
import Scrollable from "./Scrollable";
import "./ScrollableTable.css";
import {props, render, PureComponent} from "./ReactConstants";

class ScrollableTable extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;

        that[render] = () => {
            return <div className={`ScrollableTable`}>
                <Scrollable>
                    <Table {...props(that)}/>
                </Scrollable>
            </div>;
        }
    }
}

export default ScrollableTable