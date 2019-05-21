import React from 'react';
import Route from "./Route";
import {mount} from 'enzyme';
import {pushLocation} from './HistoryTools'

it('renders exact path', () => {
    pushLocation('/test');
    expect(mount(<Route path="/test">
        <div>test</div>
    </Route>)).toContainReact(<div>test</div>);
});

it('renders exact path with / on the end', () => {
    pushLocation('/test/');
    expect(mount(<Route path="/test">
        <div>test</div>
    </Route>)).toContainReact(<div>test</div>);
});

it('renders not url', () => {
    const wrapper = mount(<div>
        <Route path="/!test">
            not test
        </Route>
        <Route path="/test">
            test
        </Route>
    </div>);

    pushLocation('/');
    expect(wrapper).toHaveHTML('<div>not test</div>');

    pushLocation('/test');
    expect(wrapper).toHaveHTML('<div>test</div>');
});

it('do not render not matching url', () => {
    pushLocation('/');
    expect(mount(<Route path="/test">
        <div>test</div>
    </Route>)).not.toContainReact(<div>test</div>);
});

it('renders /*', () => {
    expect(mount(<Route path="/*">
        <div>test</div>
    </Route>)).toContainReact(<div>test</div>);

    pushLocation('/test');
    expect(mount(<Route path="/*">
        <div>test</div>
    </Route>)).toContainReact(<div>test</div>);
});

it('renders path with variable', () => {
    pushLocation('/test');
    const WithVariable = ({id}) => <div>{id}</div>;
    expect(mount(<Route path="/:id">
        <WithVariable/>
    </Route>)).toContainReact(<div>test</div>);
});

it('do not render if require variable', () => {
    pushLocation('/');
    const WithVariable = ({id}) => <div>{id}</div>;
    expect(mount(<div>
        <Route path="/:id">
            <WithVariable/>
        </Route>
    </div>)).toHaveHTML('<div></div>');
});

it('renders path with optional variable', () => {
    const WithVariable = ({id}) => <div>optional: {id || 'default value'}</div>;

    const wrapper = mount(<Route path="/:id?">
        <WithVariable/>
    </Route>);

    pushLocation('/');
    expect(wrapper).toHaveHTML('<div>optional: default value</div>');

    pushLocation('/test');
    expect(wrapper).toHaveHTML('<div>optional: test</div>');
});

it('simple check for log urls', () => {
    pushLocation('/a/b/c');
    expect(mount(<div><Route path="/:a">
        <div>test</div>
    </Route></div>)).toHaveHTML('<div></div>');
});

it('test call onToggle', () => {
    let onToggleMatches = false;

    const wrapper = mount(<div><Route path="/test" onToggle={matches => onToggleMatches = matches}>
        test
    </Route></div>);

    pushLocation('/test');
    expect(wrapper).toHaveHTML('<div>test</div>');
    expect(onToggleMatches).toBe(true);

    pushLocation('/');
    expect(wrapper).toHaveHTML('<div></div>');
    expect(onToggleMatches).toBe(false);
});
