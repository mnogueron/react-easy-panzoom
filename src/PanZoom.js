// @flow
import * as React from 'react'

type Props = {
  zoomSpeed: number,
}

class PanZoom extends React.Component<Props> {

  container = null
  dragContainer = null

  panning = false
  mousePos = null

  state = {
    x: 0,
    y: 0,
    scale: 1,
  }

  onMouseDown = (e) => {
    if (this.panning) {
      // modern browsers will fire mousedown for touch events too
      // we do not want this: touch is handled separately.
      e.stopPropagation()
      return false
    }

    const isLeftButton = ((e.button === 1 && window.event !== null) || e.button === 0)
    if (!isLeftButton) {
      return
    }

    this.panning = true

    const offset = this.getOffset(e)
    this.mousePos = {
      x: offset.x,
      y: offset.y,
    }

  }

  onMouseMove = (e) => {
    if (this.panning) {
      const offset = this.getOffset(e)
      const dx = offset.x - this.mousePos.x
      const dy = offset.y - this.mousePos.y

      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      this.moveBy(dx, dy)
    }
  }

  onMouseUp = () => {
    this.panning = false
  }

  onMouseOut = () => {
    this.panning = false
  }

  onWheel = (e) => {
    e.preventDefault()
    const scale = this.getScaleMultiplier(e.deltaY)
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, scale)
  }

  getScaleMultiplier = (delta) => {
    let speed = 0.065 * this.props.zoomSpeed
    let scaleMultiplier = 1
    if (delta > 0) { // zoom out
      scaleMultiplier = (1 - speed)
    } else if (delta < 0) { // zoom in
      scaleMultiplier = (1 + speed)
    }

    return scaleMultiplier
  }

  moveBy = (dx, dy) => {
    this.setState(({ x: this.state.x + dx, y: this.state.y + dy }))
  }

  zoomTo = (x, y, ratio) => {
    const { x: transformX, y: transformY, scale } = this.state
    const newScale = scale * ratio
    const newX = x - ratio * (x - transformX)
    const newy = y - ratio * (y - transformY)
    this.setState({ x: newX, y: newy, scale: newScale })
  }

  getOffset = (e) => {
    const containerRect = this.container.getBoundingClientRect()
    const offsetX = e.clientX - containerRect.left
    const offsetY = e.clientY - containerRect.top
    return { x: offsetX, y: offsetY }
  }

  render() {
    const { x, y, scale } = this.state
    return (
      <div
        ref={ref => this.container = ref}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        onMouseOut={this.onMouseOut}
        onWheel={this.onWheel}
        style={{ border: 'solid 1px green', height: 500 }}
      >
        <div
          ref={ref => this.dragContainer = ref}
          style={{
            border: 'solid 1px red',
            padding: 8,
            transform: `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`
          }}
        >
          This div can be panned
        </div>
      </div>
    )
  }
}

PanZoom.defaultProps = {
  zoomSpeed: 1,
}

export default PanZoom
