import React, {MouseEventHandler} from 'react';
import ReactCreateElement from './ReactCreateElement';
import './ModalMenu.css'
import {PureComponent, stateGS, render} from "./ReactConstants";
import {classNames} from "./Tools";
import Animated from "./Animated";
import Button from "./Button";
import MaterialIcon, {MaterialIconType} from "./MaterialIcon";

export interface ModalMenuItem {
    icon: MaterialIconType,
    action: MouseEventHandler
}

export interface ModalMenuProps {
    items: ModalMenuItem[]
}

class ModalMenu extends PureComponent<ModalMenuProps> {

    constructor(props) {
        super(props);
        this.state = {};
        const isOpen = stateGS<boolean>(this);

        const toggle = () => {
            isOpen(!isOpen());
        };
        this[render] = () => {
            const {items} = this.props;
            const filtered = (items || []).filter(it => !!it);
            if (filtered.length === 0) return null;

            const open = isOpen();

            return <div className={classNames("ModalMenu", 'row', open && 'open')}>
                {filtered.map((it, i) => <Animated value={open}
                                                   key={i}
                                                   mounting={200}
                                                   unmounting={200}
                                                   mountingDelay={i * 50}
                                                   unmountingDelay={(filtered.length - i - 1) * 50}
                                                   styles={{
                                                       mounting: {right: ((filtered.length - i) * 36 + 5 + (filtered.length - i) * 5) + `px`},
                                                   }}
                >
                    <Button flat={true} round={true} onClick={it.action}>
                        <MaterialIcon icon={it.icon}/>
                    </Button>
                </Animated>)}

                <Button className={classNames("more", open && 'active')} flat={true} round={true} onClick={toggle}>
                    <MaterialIcon icon="more_vert"/>
                </Button>

                <div className="separator"/>
            </div>
        }
    }
}

export default ModalMenu;