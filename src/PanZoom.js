// @flow
import * as React from 'react'

type Props = {
  zoomSpeed?: number,
  enable?: boolean,

  onPanStart: (any) => void,
  onPan: (any) => void,
  onPanEnd: (any) => void,
}

class PanZoom extends React.Component<Props> {

  container = null
  dragContainer = null

  mousePos = null
  panning = false
  panStartTriggered = false

  state = {
    x: 0,
    y: 0,
    scale: 1,
  }

  onDoubleClick = (e) => {
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, 1.75)
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

    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)

    // TODO prevent text selection

  }

  onMouseMove = (e) => {
    if (this.panning) {

      // TODO disable if using touch

      this.triggerOnPanStart(e)

      const offset = this.getOffset(e)
      const dx = offset.x - this.mousePos.x
      const dy = offset.y - this.mousePos.y

      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      this.moveBy(dx, dy)
      this.triggerOnPan(e)
    }
  }

  onMouseUp = (e) => {
    this.triggerOnPanEnd(e)
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
    this.panning = false
  }

  onMouseOut = (e) => {
    this.triggerOnPanEnd(e)
    // don't disable panning if not container
    this.panning = false
  }

  triggerOnPanStart = (e) => {
    const { onPanStart } = this.props
    if (!this.panStartTriggered) {
      onPanStart && onPanStart(e)
    }
    this.panStartTriggered = true
  }

  triggerOnPan = (e) => {
    const { onPan } = this.props
    onPan && onPan(e)
  }

  triggerOnPanEnd = (e) => {
    const { onPanEnd } = this.props
    this.panStartTriggered = false
    onPanEnd && onPanEnd(e)
  }

  onWheel = (e) => {
    const scale = this.getScaleMultiplier(e.deltaY)
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, scale)
    e.preventDefault()
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

  zoomAbs = (x, y, zoomLevel) => {
    this.zoomTo(x, y, zoomLevel / this.state.scale)
  }

  zoomTo = (x, y, ratio) => {
    const { x: transformX, y: transformY, scale } = this.state
    const newScale = scale * ratio
    const newX = x - ratio * (x - transformX)
    const newY = y - ratio * (y - transformY)
    this.setState({ x: newX, y: newY, scale: newScale })
    debugger
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
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
        style={{ border: 'solid 1px green', height: 500 }}
      >
        <div
          ref={ref => this.dragContainer = ref}
          style={{
            border: 'solid 1px red',
            padding: 8,
            transformOrigin: '0 0 0',
            transform: `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`,
            transition: 'matrix 0.25s linear',
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
