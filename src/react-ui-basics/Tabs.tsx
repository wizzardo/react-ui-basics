import React, {PureComponent} from "react";
import "./Tabs.css";
import {classNames} from "./Tools";

export interface Tab {
    label: string | JSX.Element
    className?: string
    renderer: (active: boolean) => JSX.Element
}

export interface TabsProps {
    tabs: Tab[]
}

interface TabsState {
    active: number,
    highlighterPosition: number,
    highlighterWidth: number,
}

class Tabs extends PureComponent<TabsProps, TabsState> {
    private selector: HTMLDivElement;

    render() {
        const {tabs} = this.props;
        const {active = 0, highlighterPosition = 0, highlighterWidth = 0} = this.state || {};
        return (<div className="Tabs">
                <div className="selector" ref={el => this.selector = el}>
                    {tabs.map((tab, i) => <a key={i}
                                             className={classNames(`tab `, i === active && 'active', tab.className)}
                                             href="#"
                                             onClick={this.openTab}>
                        {tab.label}
                    </a>)}
                    <span className="highlighter" style={{transform: `translateX(${highlighterPosition}px) scale(${highlighterWidth},1)`}}/>
                </div>
                <div className="contents">
                    {tabs.map((tab, i) => <div key={i} className={`content ${i === active ? 'visible' : 'hidden'}`}>{tab.renderer(i === active)}</div>)}
                </div>
            </div>
        );
    }

    openTab = (e) => {
        e.preventDefault();
        let i = 0;
        let child = e.target;
        while ((child = child.previousSibling) != null) i++;

        this.setState({active: i, highlighterPosition: e.target.offsetLeft, highlighterWidth: e.target.offsetWidth});
    };

    componentDidMount() {
        const selected = this.selector.childNodes[0] as HTMLElement;
        this.setState({active: 0, highlighterPosition: selected.offsetLeft, highlighterWidth: selected.offsetWidth});
    }
}

export default Tabs;




