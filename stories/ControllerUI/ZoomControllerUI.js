import * as React from 'react'
import Button from './Button'

const ZoomControllerUI = ({ onZoomIn, onZoomOut }) => {
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
        onClick={onZoomIn}
        style={{
          borderBottom: '1px solid #ccc',
        }}
      >
        <i className="material-icons">add</i>
      </Button>
      <Button onClick={onZoomOut}>
        <i className="material-icons">remove</i>
      </Button>
    </div>
  )
}

export default ZoomControllerUI
