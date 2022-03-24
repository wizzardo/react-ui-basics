import React from 'react';
import Table, {TableProps, TableState} from "./Table";
import Scrollable from "./Scrollable";
import "./ScrollableTable.css";
import {props, render, PureComponent} from "./ReactConstants";
import {createRef} from "./Tools";

export interface WithScrollable {
    getScrollable: () => Scrollable
}

export interface ScrollableTableProps<T> extends TableProps<T> {
    scrollableProps?: any
}

class ScrollableTable<T> extends PureComponent<ScrollableTableProps<T>, TableState<T>> implements WithScrollable {

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

    getScrollable(): Scrollable {
        return undefined;
    }
}

export default ScrollableTable