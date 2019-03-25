import * as React from 'react'
import Button from './Button'
import injectSheet from 'react-jss'

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  top: {
    borderTop: '2px solid rgba(0,0,0,0.2)',
    borderLeft: '2px solid rgba(0,0,0,0.2)',
    borderRight: '2px solid rgba(0,0,0,0.2)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  bottom: {
    borderBottom: '2px solid rgba(0,0,0,0.2)',
    borderLeft: '2px solid rgba(0,0,0,0.2)',
    borderRight: '2px solid rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  left: {
    borderTop: '2px solid rgba(0,0,0,0.2)',
    borderLeft: '2px solid rgba(0,0,0,0.2)',
    borderBottom: '2px solid rgba(0,0,0,0.2)',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  right: {
    borderTop: '2px solid rgba(0,0,0,0.2)',
    borderBottom: '2px solid rgba(0,0,0,0.2)',
    borderRight: '2px solid rgba(0,0,0,0.2)',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  empty: {
    width: 30,
    backgroundColor: 'white',
  },
}

const PadControllerUI = ({ classes, moveByRatio }) => {
  return (
    <div className={classes.root}>
      <div className={classes.top}>
        <Button onClick={() => moveByRatio(0, -1)}>
          <i className="material-icons">keyboard_arrow_up</i>
        </Button>
      </div>

      <div style={{ display: 'flex' }}>
        <div className={classes.left}>
          <Button onClick={() => moveByRatio(-1, 0)}>
            <i className="material-icons">keyboard_arrow_left</i>
          </Button>
        </div>

        <div className={classes.empty}/>

        <div className={classes.right}>
          <Button onClick={() => moveByRatio(1, 0)}>
            <i className="material-icons">keyboard_arrow_right</i>
          </Button>
        </div>
      </div>

      <div className={classes.bottom}>
        <Button onClick={() => moveByRatio(0, 1)}>
          <i className="material-icons">keyboard_arrow_down</i>
        </Button>
      </div>
    </div>
  )
}

PadControllerUI.defaultProps = {
  moveByRatio: () => {},
}

export default injectSheet(styles)(PadControllerUI)
