import React, { useRef } from 'react'

import { storiesOf } from '@storybook/react'
import { withKnobs, boolean } from '@storybook/addon-knobs';
import ControllerUI from './ControllerUI'
import PanZoom from '../src/PanZoom'

const Box = ({ children }) => (
  <div style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
    {children}
  </div>
)

const DefaultPanZoom = (props) => (
  <PanZoom
    style={{ border: 'solid 1px green', height: 500, overflow: 'hidden' }}
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
    noStateUpdate={false}
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
      <Box>
        This div can be panned only from the outside
      </Box>
    </DefaultPanZoom>
  )
}

const PanZoomControlUI = () => {
  const panZoom = useRef(null)

  function onZoomIn() {
    panZoom.current && panZoom.current.zoomIn()
  }

  function onZoomOut() {
    panZoom.current && panZoom.current.zoomOut()
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 8, top: 8 }}>
        <ControllerUI
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>
      <PanZoom
        ref={panZoom}
        style={{ border: 'solid 1px green', height: 500, overflow: 'hidden' }}
        disableKeyInteraction={boolean('Disabled key interaction', false)}
        realPinch={boolean('Enable real pinch', false)}
        minZoom={0.5}
        maxZoom={3}
        autoCenter
      >
        <Box>
          This div can be panned
        </Box>
      </PanZoom>
    </div>
  )
}

storiesOf('react-easy-panzoom', module)
  .addDecorator(withKnobs)
  .add('Basic', () => (
    <DefaultPanZoom>
      <Box>
        This div can be panned
      </Box>
    </DefaultPanZoom>
  ))
  .add('Prevent pan', () => (
    <PanZoomPreventPan />
  ))
  .add('No state update on pan', () => (
    <DefaultPanZoom
      noStateUpdate={boolean('Disable state update on pan', true)}
    >
      <Box>
        This div can be panned
      </Box>
    </DefaultPanZoom>
  ))
  .add('Control UI', () => (
    <PanZoomControlUI />
  ))
