import React from 'react'

import { storiesOf } from '@storybook/react'
import { withKnobs, boolean } from '@storybook/addon-knobs';
import PanZoom from '../src/PanZoom'

storiesOf('react-easy-panzoom', module)
  .addDecorator(withKnobs)
  .add('PanZoom', () => (
    <PanZoom
      style={{ border: 'solid 1px green', height: 500 }}
      disabled={boolean('Disabled', false)}
      disableKeyInteraction={boolean('Disabled key interaction', false)}
      realPinch={boolean('Enable real pinch', false)}
      autoCenterZoomLevel={1}
      autoCenter
    >
      <div style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
        This div can be panned
      </div>
    </PanZoom>
  ))
