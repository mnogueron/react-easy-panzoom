import * as React from 'react'
import injectSheet from 'react-jss'
import Landscape from './john-westrock-638048-unsplash.jpg'

const styles = {
  root: {
    display: 'inline-block',
  },
  image: {
    backgroundImage: `url(${Landscape})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    height: 300,
    width: 500,
    userDrag: 'none',
  },
  button: {
    textAlign: 'center',
    borderRadius: 4,
    padding: 8,
    border: '2px solid rgba(0,0,0,0.2)',

    '&:hover': {
      backgroundColor: '#f4f4f4',
    },
  },
}

const ContentBox = ({ classes }) => {
  return (
    <div className={classes.root}>
      <div className={classes.image} />
      <div className={classes.button}>Button</div>
    </div>
  )
}

export default injectSheet(styles)(ContentBox)
