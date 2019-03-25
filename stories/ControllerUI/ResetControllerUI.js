import * as React from 'react'
import Button from './Button'

const ResetControllerUI = ({ center, reset }) => {
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
        onClick={center}
        style={{
          borderBottom: '1px solid #ccc',
        }}
      >
        <i className="material-icons">center_focus_weak</i>
      </Button>
      <Button onClick={reset}>
        <i className="material-icons">autorenew</i>
      </Button>
    </div>
  )
}

export default ResetControllerUI
