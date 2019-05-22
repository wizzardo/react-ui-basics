import React from 'react';
import {classNames, orNoop, ref, preventDefault, stopPropagation} from "./Tools";

const init = that => orNoop(that.props.initializer)(that);

class Droppable extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate(prevProps) {
        if (prevProps.initializer !== this.props.initializer)
            init(this)
    };

    render() {
        const {children, className} = this.props;
        const {hover, allow} = this.state;
        return <div className={
            classNames(
                'Droppable',
                className,
                hover && 'hover',
                allow && 'allow',
            )}
                    onDragOver={e => {
                        preventDefault(e);
                        stopPropagation(e)
                    }}
                    ref={ref('element', this)}>
            {children}
        </div>;
    };

    componentDidMount() {
        init(this)
    }

    componentWillUnmount() {
        orNoop(this.onUnmount)();
    };
}


export default Droppable;