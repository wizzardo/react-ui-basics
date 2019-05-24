import React from 'react';
import './Snackbar.css'
import {classNames} from "./Tools";

class Snackbar extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            shown: false,
            text: '',
        };
    }

    render() {
        const {className, text = this.state.text} = this.props;
        const {shown} = this.state;

        return (
            <div className={classNames(`Snackbar`, className, shown && 'shown')}>
                <div className="message">{text}</div>
                {/*<div className="action"><a>Undo</a></div>*/}
            </div>
        )
    }

    componentWillUnmount() {
        this.timeout && clearTimeout(this.timeout);
    }

    show = (text) => {
        if (this.state.shown) {
            clearTimeout(this.timeout);
            this.setState({shown: false});
            this.timeout = setTimeout(() => this.show(text), 260);
        } else {
            this.setState({shown: true, text});
            this.timeout = setTimeout(() => this.setState({shown: false}), 3000);
        }
    }
}

export default Snackbar;