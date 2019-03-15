import { configure, addParameters } from '@storybook/react'
import { create } from '@storybook/theming'

addParameters({
  options: {
    theme: create({
      base: 'light',
      brandTitle: 'React HTML Pan and zoom',
      brandUrl: 'https://github.com/mnogueron/react-panzoom',
      // To control appearance:
      // brandImage: 'http://url.of/some.svg',
    }),
    isFullscreen: false,
    panelPosition: 'right',
  },
})

// automatically import all files ending in *.stories.js
const req = require.context('../stories', true, /.stories.js$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
