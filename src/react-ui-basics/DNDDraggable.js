import React from 'react';
import {classNames, orNoop, ref} from "./Tools";

const init = that => orNoop(that.props.initializer)(that);

class Draggable extends React.PureComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidUpdate(prevProps) {
        if (prevProps.handle !== this.props.handle || prevProps.initializer !== this.props.initializer)
            init(this)
    };

    render() {
        const {children, className, onClick, handle} = this.props;
        const {dragged, placeholder, hover} = this.state;
        return <div className={classNames('Draggable', className,
            dragged && 'dragged',
            placeholder && 'placeholder',
            hover && 'hover',
        )}
                    onClick={onClick}
                    ref={ref('element', this)}
        >
            {handle}
            {children}
        </div>;
    };

    componentDidMount() {
        init(this)
    };

    componentWillUnmount() {
        orNoop(this.onUnmount)();
    }
}


export default Draggable;