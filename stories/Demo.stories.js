import React, { useRef } from 'react'

import { storiesOf } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs';
import PanZoom from '../src/PanZoom'
import Picture from './john-westrock-638048-unsplash.jpg'

const InstagramDemo = () => {
  const ref = useRef(null)

  function onPanEnd() {
    ref.current.reset()
  }

  return (
    <PanZoom
      ref={ref}
      style={{ border: 'solid 1px green', height: 300, width: 300 }}
      minZoom={1}
      maxZoom={2}
      autoCenterZoomLevel={1}
      realPinch
      onPanEnd={onPanEnd}
    >
      <div
        style={{
          width: 300,
          height: 300,
          backgroundImage: `url('${Picture}')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      />
    </PanZoom>
  )
}

storiesOf('Demo', module)
  .addDecorator(withKnobs)
  .add('Instagram pinch to zoom', () => <InstagramDemo />)
