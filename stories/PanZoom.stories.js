import React, { useRef } from 'react'

import { storiesOf } from '@storybook/react'
import { withKnobs, boolean, number } from '@storybook/addon-knobs';
import ZoomControllerUI from './ControllerUI/ZoomControllerUI'
import PadControllerUI from './ControllerUI/PadControllerUI'
import ResetControllerUI from './ControllerUI/ResetControllerUI'
import RotationControllerUI from './ControllerUI/RotationControllerUI'
import PanZoom from '../src/PanZoom'
import ContentBox from './ContentBox'

const Box = ({ children }) => (
  <div style={{ border: 'solid 1px red', padding: 8, left: 6 }}>
    {children}
  </div>
)

const DefaultPanZoom = (props) => (
  <PanZoom
    style={{ border: 'solid 1px green', height: 500, overflow: 'hidden' }}
    minZoom={0.5}
    maxZoom={3}
    autoCenterZoomLevel={1}
    autoCenter
    noStateUpdate={true}
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

const PanZoomControlUI = (props) => {
  const panZoom = useRef(null)

  function onZoomIn() {
    panZoom.current && panZoom.current.zoomIn()
  }

  function onZoomOut() {
    panZoom.current && panZoom.current.zoomOut()
  }

  function moveByRatio(x, y) {
    panZoom.current && panZoom.current.moveByRatio(x, y)
  }

  function center() {
    panZoom.current && panZoom.current.autoCenter()
  }

  function reset() {
    panZoom.current && panZoom.current.reset()
  }

  function rotateClockwise() {
    panZoom.current && panZoom.current.rotate(prevAngle => prevAngle + 10)
  }

  function rotateCounterClockwise() {
    panZoom.current && panZoom.current.rotate(prevAngle => prevAngle - 10)
  }

  return (
    <div style={{ position: 'relative' }}>
      <PanZoom
        ref={panZoom}
        style={{ border: 'solid 1px green', height: 500, overflow: 'hidden' }}
        minZoom={0.5}
        maxZoom={3}
        autoCenter
        {...props}
      >
        <ContentBox />
      </PanZoom>

      <div style={{ position: 'absolute', left: 8, top: 8, zIndex: 1 }}>
        <ZoomControllerUI
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>

      <div style={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
        <RotationControllerUI
          rotateClockwise={rotateClockwise}
          rotateCounterClockwise={rotateCounterClockwise}
        />
      </div>

      <div style={{ position: 'absolute', left: 8, bottom: 8 }}>
        <ResetControllerUI
          reset={reset}
          center={center}
        />
      </div>

      <div style={{ position: 'absolute', right: 8, bottom: 8 }}>
        <PadControllerUI moveByRatio={moveByRatio}/>
      </div>
    </div>
  )
}

storiesOf('react-easy-panzoom', module)
  .addDecorator(withKnobs)
  .add('Basic', () => (
    <DefaultPanZoom
      disabled={boolean('Disabled', false)}
      disableKeyInteraction={boolean('Disabled key interaction', false)}
      realPinch={boolean('Enable real pinch', false)}
      keyMapping={
        boolean('Enable additional key mapping', false) ?
          {
            '87': { x: 0, y: -1, z: 0 },
            '83': { x: 0, y: 1, z: 0 },
            '65': { x: -1, y: 0, z: 0 },
            '68': { x: 1, y: 0, z: 0 },
          } : {}
      }
    >
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
      maxZoom={Infinity}
      noStateUpdate={boolean('Disable state update on pan', true)}
    >
      <Box>
        This div can be panned
      </Box>
    </DefaultPanZoom>
  ))
  .add('Bounding box', () => (
    <DefaultPanZoom
      maxZoom={Infinity}
      boundaryRatioHorizontal={number('Horizontal boundary ratio', 0.8, { range: true, min: -1, max: 2, step: 0.1 })}
      boundaryRatioVertical={number('Vertical boundary ratio', 0.8, { range: true, min: -1, max: 2, step: 0.1 })}
      enableBoundingBox
    >
      <Box>
        This div can be panned
      </Box>
    </DefaultPanZoom>
  ))
  .add('Control UI', () => (
    <PanZoomControlUI
      disableKeyInteraction={boolean('Disabled key interaction', false)}
      boundaryRatioHorizontal={number('Horizontal boundary ratio', 0.8, { range: true, min: -1, max: 2, step: 0.1 })}
      boundaryRatioVertical={number('Vertical boundary ratio', 0.8, { range: true, min: -1, max: 2, step: 0.1 })}
      enableBoundingBox
      realPinch={boolean('Enable real pinch', false)}
    />
  ))
  .add('Disable Double Click Zoom Event', () => (
    <DefaultPanZoom
      maxZoom={Infinity}
      disableDoubleClickZoom={boolean('Disabel Double Click Zoom', true)}
    >
      <Box>
        Double Click should not zoom
      </Box>
    </DefaultPanZoom>
  ))
