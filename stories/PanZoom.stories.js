import React from 'react'

import { storiesOf } from '@storybook/react'
import PanZoom from '../src/PanZoom'

storiesOf('react-panzoom', module)
  .add('PanZoom', () => (
    <PanZoom
      style={{ border: 'solid 1px green', height: 500 }}
      autoCenterZoomLevel={1}
      autoCenter
    >
      <div style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
        This div can be panned
      </div>
    </PanZoom>
  ))
