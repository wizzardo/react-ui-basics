import React from 'react';
import ReactCreateElement from './ReactCreateElement';
import Table from "./Table";
import Scrollable from "./Scrollable";
import "./ScrollableTable.css";
import {props, render, PureComponent} from "./ReactConstants";
import {createRef} from "./Tools";
import PropTypes from "prop-types";

class ScrollableTable extends PureComponent {

    constructor(properties) {
        super(properties);
        const that = this;

        const scrollableRef = createRef();

        that[render] = () => {
            return <div className={`ScrollableTable`}>
                <Scrollable ref={scrollableRef} {...props(that).scrollableProps}>
                    <Table {...props(that)}/>
                </Scrollable>
            </div>;
        }
        that.getScrollable = () => scrollableRef()
    }
}

export default ScrollableTable

if (window.isNotProductionEnvironment) {
    ScrollableTable.propTypes = Table.propTypes;
}