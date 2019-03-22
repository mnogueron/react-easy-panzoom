import React, { useRef } from 'react'

import { storiesOf } from '@storybook/react'
import { withKnobs, boolean } from '@storybook/addon-knobs';
import PanZoom from '../src/PanZoom'

const DefaultPanZoom = (props) => (
  <PanZoom
    style={{ border: 'solid 1px green', height: 500 }}
    disabled={boolean('Disabled', false)}
    disableKeyInteraction={boolean('Disabled key interaction', false)}
    realPinch={boolean('Enable real pinch', false)}
    minZoom={0.5}
    maxZoom={3}
    keyMapping={
      boolean('Enable additional key mapping', false) ?
        {
          '87': { x: 0, y: -1, z: 0 },
          '83': { x: 0, y: 1, z: 0 },
          '65': { x: -1, y: 0, z: 0 },
          '68': { x: 1, y: 0, z: 0 },
        } : {}
    }
    autoCenterZoomLevel={1}
    autoCenter
    style={{ overflow: 'hidden', height: 500 }}
    {...props}
  />
)


const PanZoomPreventPan = () => {

  const content = useRef(null)

  function preventPan(e, x, y) {
    if (e.target === content.current) {
      return true
    }

    const contentRect = content.current.getBoundingClientRect()

    const x1 = contentRect.left
    const x2 = contentRect.right
    const y1 = contentRect.top
    const y2 = contentRect.bottom

    return (x >= x1 && x <= x2) && (y >= y1 && y <= y2)
  }

  return (
    <DefaultPanZoom preventPan={preventPan}>
      <div ref={content} style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
        This div can be panned only from the outside
      </div>
    </DefaultPanZoom>
  )
}

storiesOf('react-easy-panzoom', module)
  .addDecorator(withKnobs)
  .add('Basic', () => (
    <DefaultPanZoom>
      <div style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
        This div can be panned
      </div>
    </DefaultPanZoom>
  ))
  .add('Prevent pan', () => (
    <PanZoomPreventPan />
  ))
  .add('No state update on pan', () => (
    <DefaultPanZoom
      noStateUpdate={boolean('Disable state update on pan', true)}
    >
      <div style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
        This div can be panned
      </div>
    </DefaultPanZoom>
  ))
