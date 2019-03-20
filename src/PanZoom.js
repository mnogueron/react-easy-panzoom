// @flow
import * as React from 'react'

type Props = {
  zoomSpeed?: number,
  doubleZoomSpeed?: number,
  disabled?: boolean,
  autoCenter?: boolean,
  autoCenterZoomLevel?: number,
  disableKeyInteraction?: boolean,
  realPinch?: boolean,
  keyMapping?: { [string]: { x: number, y: number, z: number }},

  onPanStart?: (any) => void,
  onPan?: (any) => void,
  onPanEnd?: (any) => void,
}

// TODO support minZoom, maxZoom
class PanZoom extends React.Component<Props> {

  container = null
  dragContainer = null

  mousePos = null
  panning = false
  touchInProgress = false
  panStartTriggered = false

  pinchZoomLength = 0

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

  componentWillUnmount(): void {
    this.cleanMouseListeners()
    this.cleanTouchListeners()
    this.releaseTextSelection()
  }

  onDoubleClick = (e) => {
    const { doubleZoomSpeed } = this.props
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, doubleZoomSpeed)
  }

  onMouseDown = (e) => {
    if (this.props.disabled) {
      return
    }

    // Touch events fire mousedown on modern browsers, but it should not
    // be considered as we will handle touch event separately
    if (this.touchInProgress) {
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

    this.setMouseListeners()

    // Prevent text selection
    this.captureTextSelection()
  }

  onMouseMove = (e) => {
    if (this.panning) {

      // TODO disable if using touch event

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
    this.cleanMouseListeners()
    this.panning = false
    this.releaseTextSelection()
  }

  // TODO probably add zoom props to stop pan on parent container mouseout
  onMouseOut = (e) => {
    this.triggerOnPanEnd(e)
    this.panning = false
  }

  onWheel = (e) => {
    if (this.props.disabled) {
      return
    }

    const scale = this.getScaleMultiplier(e.deltaY)
    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, scale)
    e.preventDefault()
  }

  onKeyDown = (e) => {
    const { keyMapping, disableKeyInteraction } = this.props

    if (disableKeyInteraction) {
      return
    }

    const keys = {
      '38': { x: 0, y: 1, z: 0 }, // up
      '40': { x: 0, y: -1, z: 0 }, // down
      '37': { x: 1, y: 0, z: 0 }, // left
      '39': { x: -1, y: 0, z: 0 }, // right
      '189': { x: 0, y: 0, z: 1 }, // zoom out
      '109': { x: 0, y: 0, z: 1 }, // zoom out
      '187': { x: 0, y: 0, z: -1 }, // zoom in
      '107': { x: 0, y: 0, z: -1 }, // zoom in
      ...keyMapping,
    }

    const mappedCoords = keys[e.keyCode]
    if (mappedCoords) {
      const { x, y, z } = mappedCoords
      e.preventDefault()
      e.stopPropagation()

      if (x || y) {
        const containerRect = this.container.getBoundingClientRect()
        const offset = Math.min(containerRect.width, containerRect.height)
        const moveSpeedRatio = 0.05
        const dx = offset * moveSpeedRatio * x
        const dy = offset * moveSpeedRatio * y

        this.moveBy(dx, dy)
      }

      if (z) {
        const scaleMultiplier = this.getScaleMultiplier(z)
        const containerRect = this.container.getBoundingClientRect()
        this.zoomTo(containerRect.width / 2, containerRect.height / 2, scaleMultiplier)
      }
    }
  }

  onTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Drag
      const touch = e.touches[0]
      const offset = this.getOffset(touch)
      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      this.touchInProgress = true
      this.setTouchListeners()
    } else if (e.touches.length === 2) {
      // pinch
      this.pinchZoomLength = this.getPinchZoomLength(e.touches[0], e.touches[1])
      this.touchInProgress = true
      this.setTouchListeners()
    }
  }

  onToucheMove = (e) => {
    const { realPinch } = this.props
    if (e.touches.length === 1) {
      e.stopPropagation()
      const touch = e.touches[0]
      const offset = this.getOffset(touch)
      const dx = offset.x - this.mousePos.x
      const dy = offset.y - this.mousePos.y

      if (dx !== 0 || dy !== 0) {
        this.triggerOnPanStart(e)
      }

      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      this.moveBy(dx, dy)
      this.triggerOnPan(e)
    } else if (e.touches.length === 2) {
      const finger1 = e.touches[0]
      const finger2 = e.touches[1]
      const currentPinZoomLength = this.getPinchZoomLength(finger1, finger2)

      let scaleMultiplier = 1

      if (realPinch) {
        scaleMultiplier = currentPinZoomLength / this.pinchZoomLength
      } else {
        let delta = 0
        if (currentPinZoomLength < this.pinchZoomLength) {
          delta = 1
        } else if (currentPinZoomLength > this.pinchZoomLength) {
          delta = -1
        }
        scaleMultiplier = this.getScaleMultiplier(delta)
      }

      this.mousePos = {
        x: (finger1.clientX + finger2.clientX) / 2,
        y: (finger1.clientY + finger2.clientY) / 2,
      }
      this.zoomTo(this.mousePos.x, this.mousePos.y, scaleMultiplier)
      this.pinchZoomLength = currentPinZoomLength
      e.stopPropagation()
      e.preventDefault()
    }
  }

  onTouchEnd = (e) => {
    if (e.touches.length === 0) {
      const offset = this.getOffset(e.touches[0])
      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }
    } else {
      this.touchInProgress = false
      this.triggerOnPanEnd(e)
      this.cleanTouchListeners()
    }
  }

  setMouseListeners = () => {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  cleanMouseListeners = () => {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  setTouchListeners = () => {
    document.addEventListener('touchmove', this.onToucheMove)
    document.addEventListener('touchend', this.onTouchEnd)
    document.addEventListener('touchcancel', this.onTouchEnd)
  }

  cleanTouchListeners = () => {
    document.removeEventListener('touchmove', this.onToucheMove)
    document.removeEventListener('touchend', this.onTouchEnd)
    document.removeEventListener('touchcancel', this.onTouchEnd)
  }

  preventDefault = (e) => {
    e.preventDefault()
  }

  captureTextSelection = () => {
    window.addEventListener('selectstart', this.preventDefault)
  }

  releaseTextSelection = () => {
    window.removeEventListener('selectstart', this.preventDefault)
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

  getPinchZoomLength = (finger1, finger2) => {
    return Math.sqrt(
      (finger1.clientX - finger2.clientX) * (finger1.clientX - finger2.clientX) +
      (finger1.clientY - finger2.clientY) * (finger1.clientY - finger2.clientY)
    )
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
    const { children, style, disabled, disableKeyInteraction } = this.props
    const { x, y, scale } = this.state
    return (
      <div
        ref={ref => this.container = ref}
        {
          ...(disableKeyInteraction ? {} : {
            tabIndex: 0, // enable onKeyDown event
          })
        }
        onDoubleClick={this.onDoubleClick}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
        onKeyDown={this.onKeyDown}
        onTouchStart={this.onTouchStart}
        style={{ cursor: disabled ? 'initial' : 'pointer', ...style }}
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
