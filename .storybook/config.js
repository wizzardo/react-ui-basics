import {configure, addParameters} from '@storybook/react';

function loadStories() {
    require('../src/stories');
}

addParameters({
    options: {
        showPanel: false,
    }
});

configure(loadStories, module);
