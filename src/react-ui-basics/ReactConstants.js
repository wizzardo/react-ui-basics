const EMPTY = {};
export const props = that => that.props;
export const state = that => that.state || EMPTY;
export const setState = (that, data, cb) => that.setState(data, cb);

export const componentDidMount = 'componentDidMount';
export const componentWillUnmount = 'componentWillUnmount';
export const componentDidUpdate = 'componentDidUpdate';
export const render = 'render';
export const children = 'children';
export const className = 'className';