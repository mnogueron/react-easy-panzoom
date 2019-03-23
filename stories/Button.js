import * as React from 'react'
import injectSheet from 'react-jss'

const styles = {
  root: {
    cursor: 'pointer',
    fontSize: 22,
    width: 30,
    height: 30,
    lineHeight: '30px',
    textAlign: 'center',
    userSelect: 'none',

    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
}

const Button = ({ classes, children, ...rest }) => {
  return (
    <div
      className={classes.root}
      {...rest}
    >
      {children}
    </div>
  )
}

export default injectSheet(styles)(Button)
