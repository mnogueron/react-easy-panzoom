import * as React from 'react'
import Button from './Button'
import injectSheet from 'react-jss'

const styles = {
  root: {
    border: '2px solid rgba(0,0,0,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
}

const RotationControllerUI = ({ classes, rotateClockwise, rotateCounterClockwise }) => {
  return (
    <div className={classes.root}>
      <Button
        onClick={rotateClockwise}
        style={{
          borderBottom: '1px solid #ccc',
        }}
      >
        <i className="material-icons">refresh</i>
      </Button>
      <Button onClick={rotateCounterClockwise}>
        <i className="material-icons" style={{ transform: 'rotate(180deg)' }}>refresh</i>
      </Button>
    </div>
  )
}

export default injectSheet(styles)(RotationControllerUI)
