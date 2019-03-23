import * as React from 'react'
import Button from './Button'

const ControllerUi = ({ onZoomIn, onZoomOut }) => {
  return (
    <div
      style={{
        border: '2px solid rgba(0,0,0,0.2)',
        borderRadius: 4,
      }}
    >
      <Button
        onClick={onZoomIn}
        style={{
          borderBottom: '1px solid #ccc',
        }}
      >
        {'+'}
      </Button>
      <Button onClick={onZoomOut}>
        {'-'}
      </Button>
    </div>
  )
}

export default ControllerUi
