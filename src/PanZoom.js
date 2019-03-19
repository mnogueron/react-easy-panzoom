// @flow
import * as React from 'react'

type Props = {
  zoomSpeed?: number,
  doubleZoomSpeed?: number,
  enable?: boolean,
  autoCenter?: boolean,
  autoCenterZoomLevel?: number,

  onPanStart?: (any) => void,
  onPan?: (any) => void,
  onPanEnd?: (any) => void,
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

  componentDidMount(): void {
    const { autoCenter, autoCenterZoomLevel } = this.props
    if (autoCenter) {
      this.autoCenter(autoCenterZoomLevel)
    }
  }

  componentDidUpdate(prevProps): void {
    if (prevProps.autoCenter !== this.props.autoCenter
      && this.props.autoCenter) {
      this.autoCenter(this.props.autoCenterZoomLevel)
    }
  }

  onDoubleClick = (e) => {
    const { doubleZoomSpeed } = this.props
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, doubleZoomSpeed)
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

  onWheel = (e) => {
    const scale = this.getScaleMultiplier(e.deltaY)
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, scale)
    e.preventDefault()
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

  autoCenter = (zoomLevel = 1) => {
    const containerRect = this.container.getBoundingClientRect()
    const clientRect = this.dragContainer.getBoundingClientRect()
    const widthRatio = containerRect.width / clientRect.width
    const heightRatio = containerRect.height / clientRect.height
    const scale = Math.min(widthRatio, heightRatio) * zoomLevel
    const x = (containerRect.width - (clientRect.width * scale)) / 2
    const y = (containerRect.height - (clientRect.height * scale)) / 2
    this.setState({ x, y, scale })
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
  }

  getOffset = (e) => {
    const containerRect = this.container.getBoundingClientRect()
    const offsetX = e.clientX - containerRect.left
    const offsetY = e.clientY - containerRect.top
    return { x: offsetX, y: offsetY }
  }

  render() {
    const { children, style } = this.props
    const { x, y, scale } = this.state
    return (
      <div
        ref={ref => this.container = ref}
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
        style={style}
      >
        <div
          ref={ref => this.dragContainer = ref}
          style={{
            transformOrigin: '0 0 0',
            transform: `matrix(${scale}, 0, 0, ${scale}, ${x}, ${y})`,
            transition: 'all 0.05s linear',
          }}
        >
          {children}
        </div>
      </div>
    )
  }
}

PanZoom.defaultProps = {
  zoomSpeed: 1,
  doubleZoomSpeed: 1.75,
}

export default PanZoom
