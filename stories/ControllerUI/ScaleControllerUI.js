import * as React from 'react'
import Button from './Button'

const ScaleControllerUI = ({ onSetScale }) => {
  return (
    <div
      style={{
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      <Button 
        onClick={() => onSetScale(1)}
        style={{
          borderBottom: '1px solid #ccc',
        }}
      >
        1
      </Button>
      <Button
        onClick={() => onSetScale(0.75)}
        style={{
          borderBottom: '1px solid #ccc',
        }}
      >
        .75
      </Button>
      <Button onClick={() => onSetScale(0.5)}>
        .5
      </Button>
    </div>
  )
}

export default ScaleControllerUI
