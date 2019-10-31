import {configure, addParameters} from '@storybook/react';

function loadStories() {
    require('../src/stories');
}

addParameters({
    options: {
        showPanel: true,
        panelPosition: 'right',
    }
});

// configure(loadStories, module);

// automatically import all files ending in *.stories.js
configure(require.context('../src/stories', true, /\.stories\.js$/), module);