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
  minZoom?: number,
  maxZoom?: number,
  preventPan?: (event: SyntheticEvent, x: number, y: number) => boolean,
  noStateUpdate?: boolean,

  onPanStart?: (any) => void,
  onPan?: (any) => void,
  onPanEnd?: (any) => void,
}

class PanZoom extends React.Component<Props> {

  container = null
  dragContainer = null

  mousePos = null
  panning = false
  touchInProgress = false
  panStartTriggered = false

  pinchZoomLength = 0

  prevPanPosition = {
    x: 0,
    y: 0,
  }

  frameAnimation = null
  intermediateFrameAnimation = null

  transformMatrixString = null
  intermediateTransformMatrixString = null

  state = {
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
  }

  componentDidMount(): void {
    const { autoCenter, autoCenterZoomLevel, minZoom, maxZoom } = this.props
    if (maxZoom < minZoom) {
      throw new Error('[PanZoom]: maxZoom props cannot be inferior to minZoom')
    }
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
    const { preventPan } = this.props
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

    const offset = this.getOffset(e)

    // check if there is nothing preventing the pan
    if (preventPan(e, offset.x, offset.y)) {
      return
    }

    this.mousePos = {
      x: offset.x,
      y: offset.y,
    }

    // keep the current pan value in memory to allow noStateUpdate panning
    this.prevPanPosition = {
      x: this.state.x,
      y: this.state.y,
    }

    this.panning = true

    this.setMouseListeners()

    // Prevent text selection
    this.captureTextSelection()
  }

  onMouseMove = (e) => {
    if (this.panning) {
      const { noStateUpdate } = this.props

      // TODO disable if using touch event

      this.triggerOnPanStart(e)

      const offset = this.getOffset(e)
      const dx = offset.x - this.mousePos.x
      const dy = offset.y - this.mousePos.y

      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      this.moveBy(dx, dy, noStateUpdate)
      this.triggerOnPan(e)
    }
  }

  onMouseUp = (e) => {
    // if using noStateUpdate we still need to set the new values in the state
    this.dispatchStateUpdateIfNeeded()

    this.triggerOnPanEnd(e)
    this.cleanMouseListeners()
    this.panning = false
    this.releaseTextSelection()
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
      '38': { x: 0, y: -1, z: 0 }, // up
      '40': { x: 0, y: 1, z: 0 }, // down
      '37': { x: -1, y: 0, z: 0 }, // left
      '39': { x: 1, y: 0, z: 0 }, // right
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
        this.centeredZoom(z)
      }
    }
  }

  onTouchStart = (e) => {
    const { preventPan } = this.props
    if (e.touches.length === 1) {
      // Drag
      const touch = e.touches[0]
      const offset = this.getOffset(touch)

      if (preventPan(e, offset.x, offset.y)) {
        return
      }

      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      // keep the current pan value in memory to allow noStateUpdate panning
      this.prevPanPosition = {
        x: this.state.x,
        y: this.state.y,
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
    const { realPinch, noStateUpdate } = this.props
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

      this.moveBy(dx, dy, noStateUpdate)
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
    }
  }

  onTouchEnd = (e) => {
    if (e.touches.length > 0) {
      const offset = this.getOffset(e.touches[0])
      this.mousePos = {
        x: offset.x,
        y: offset.y,
      }

      // when removing a finger we don't go through onTouchStart
      // thus we need to set the prevPanPosition here
      this.prevPanPosition = {
        x: this.state.x,
        y: this.state.y,
      }
    } else {
      this.dispatchStateUpdateIfNeeded()
      this.touchInProgress = false

      this.triggerOnPanEnd(e)
      this.cleanTouchListeners()
    }
  }

  dispatchStateUpdateIfNeeded = () => {
    const { noStateUpdate } = this.props
    if (noStateUpdate) {
      this.setState(({ x: this.prevPanPosition.x, y: this.prevPanPosition.y }))
    }
  }

  setMouseListeners = () => {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  cleanMouseListeners = () => {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)

    if (this.frameAnimation) {
      window.cancelAnimationFrame(this.frameAnimation)
      this.frameAnimation = 0
    }

    if (this.intermediateFrameAnimation) {
      window.cancelAnimationFrame(this.intermediateFrameAnimation)
      this.intermediateFrameAnimation = 0
    }
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

    if (this.frameAnimation) {
      window.cancelAnimationFrame(this.frameAnimation)
      this.frameAnimation = 0
    }

    if (this.intermediateFrameAnimation) {
      window.cancelAnimationFrame(this.intermediateFrameAnimation)
      this.intermediateFrameAnimation = 0
    }
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
    const { minZoom, maxZoom } = this.props
    const { scale: prevScale } = this.state
    const containerRect = this.container.getBoundingClientRect()
    const clientRect = this.dragContainer.getBoundingClientRect()
    const widthRatio = containerRect.width / clientRect.width
    const heightRatio = containerRect.height / clientRect.height
    let scale = Math.min(widthRatio, heightRatio) * zoomLevel * prevScale

    if (scale < minZoom) {
      console.warn(`[PanZoom]: initial zoomLevel produces a scale inferior to minZoom, reverted to default: ${minZoom}. Consider using a zoom level > ${minZoom}`)
      scale = minZoom
    }
    else if (scale > maxZoom) {
      console.warn(`[PanZoom]: initial zoomLevel produces a scale superior to maxZoom, reverted to default: ${maxZoom}. Consider using a zoom level < ${maxZoom}`)
      scale = maxZoom
    }

    const x = (containerRect.width - (clientRect.width/prevScale * scale)) / 2
    const y = (containerRect.height - (clientRect.height/prevScale * scale)) / 2
    this.setState({ x, y, scale })
  }

  moveByRatio = (x, y, moveSpeedRatio = 0.05) => {
    const containerRect = this.container.getBoundingClientRect()
    const offset = Math.min(containerRect.width, containerRect.height)
    const dx = offset * moveSpeedRatio * x
    const dy = offset * moveSpeedRatio * y

    this.moveBy(dx, dy)
  }

  moveBy = (dx, dy, noStateUpdate) => {
    const { x, y, scale, rotate } = this.state

    // Allow better performance by not updating the state on every change
    if (noStateUpdate) {
      const { boundX, boundY } = this.getBoundCoordinates(this.prevPanPosition.x + dx, this.prevPanPosition.y + dy, scale)

      const intermediateX = x + (x - boundX) / 2
      const intermediateY = y + (y - boundY) / 2

      this.intermediateTransformMatrixString = this.getTransformMatrixString(intermediateX, intermediateY, scale, rotate)

      this.intermediateFrameAnimation = window.requestAnimationFrame(this.applyIntermediateTransform)

      this.prevPanPosition = {
        x: boundX,
        y: boundY,
      }

      this.transformMatrixString = this.getTransformMatrixString(boundX, boundY, scale, rotate)
      this.frameAnimation = window.requestAnimationFrame(this.applyTransform)
      return
    }

    const { boundX, boundY } = this.getBoundCoordinates(x + dx, y + dy, scale)
    this.setState(({ x: boundX, y: boundY}))
  }

  rotate = (value: number | (prevAngle: number) => number) => {
    const { rotate } = this.state
    let newAngle = value
    if (typeof value === 'function') {
      newAngle = value(rotate)
    }
    this.setState({ rotate: newAngle % 360 })
  }

  zoomAbs = (x, y, zoomLevel) => {
    this.zoomTo(x, y, zoomLevel / this.state.scale)
  }

  zoomTo = (x, y, ratio) => {
    const { minZoom, maxZoom } = this.props
    const { x: transformX, y: transformY, scale } = this.state

    let newScale = scale * ratio
    if (newScale < minZoom) {
      if (scale === minZoom) {
        return
      }
      ratio = minZoom / scale
      newScale = minZoom
    }
    else if (newScale > maxZoom) {
      if (scale === maxZoom) {
        return
      }
      ratio = maxZoom / scale
      newScale = maxZoom
    }

    const newX = x - ratio * (x - transformX)
    const newY = y - ratio * (y - transformY)

    const { boundX, boundY } = this.getBoundCoordinates(newX, newY, scale)
    this.setState({ x: boundX, y: boundY, scale: newScale })
  }

  centeredZoom = (delta) => {
    const scaleMultiplier = this.getScaleMultiplier(delta)
    const containerRect = this.container.getBoundingClientRect()
    this.zoomTo(containerRect.width / 2, containerRect.height / 2, scaleMultiplier)
  }

  reset = () => {
    this.setState({ x: 0, y: 0, scale: 1 })
  }

  zoomIn = () => {
    this.centeredZoom(-1)
  }

  zoomOut = () => {
    this.centeredZoom(1)
  }

  getOffset = (e) => {
    const containerRect = this.container.getBoundingClientRect()
    const offsetX = e.clientX - containerRect.left
    const offsetY = e.clientY - containerRect.top
    return { x: offsetX, y: offsetY }
  }

  getTransformMatrix = (x, y, scale, rotate) => {
    if (!this.dragContainer) {
      return { a: 1, b: 0, c: 0, d: 1, x, y }
    }

    const { clientWidth, clientHeight } = this.dragContainer
    const centerX = clientWidth / 2
    const centerY = clientHeight / 2

    const rad = rotate * Math.PI / 180
    const a = Math.cos(rad) * scale
    const b = Math.sin(rad) * scale
    const c = -b
    const d = a

    const transformX = - centerX * a + centerY * b + centerX * scale
    const transformY =   centerX * c - centerY * d + centerY * scale

    return {
      a,
      b,
      c,
      d,
      x: transformX + x,
      y: transformY + y,
    }
  }

  getTransformMatrixString = (x, y, scale, rotate) => {
    const { a, b, c, d, x: transformX, y: transformY} = this.getTransformMatrix(x, y, scale, rotate)
    return `matrix(${a}, ${b}, ${c}, ${d}, ${transformX}, ${transformY})`
  }

  applyTransform = () => {
    this.dragContainer.style.transform = this.transformMatrixString
    this.frameAnimation = 0
  }

  applyIntermediateTransform = () => {
    this.dragContainer.style.transform = this.intermediateTransformMatrixString
    this.intermediateFrameAnimation = 0
  }

  // TODO correct when rotating
  getBoundCoordinates = (x, y, newScale) => {
    const { enableBoundingBox, boundaryRatioVertical, boundaryRatioHorizontal } = this.props
    const { scale } = this.state

    if (!enableBoundingBox) {
      return {
        boundX: x,
        boundY: y,
      }
    }

    const containerRect = this.container.getBoundingClientRect()
    const clientRect = this.dragContainer.getBoundingClientRect()
    let width = clientRect.width
    let height = clientRect.height

    if (newScale) {
      width *= (scale / newScale)
      height *= (scale / newScale)
    }

    let boundX = x
    let boundY = y
    if (boundY < -boundaryRatioVertical * height) {
      boundY = -boundaryRatioVertical * height
    }
    else if (boundY > containerRect.height - (1 - boundaryRatioVertical) * height) {
      boundY = containerRect.height - (1 - boundaryRatioVertical) * height
    }

    if (boundX < -boundaryRatioHorizontal * width) {
      boundX = -boundaryRatioHorizontal * width
    }
    else if (boundX > containerRect.width - (1 - boundaryRatioHorizontal) * width) {
      boundX = containerRect.width - (1 - boundaryRatioHorizontal) * width
    }

    return { boundX, boundY }
  }

  render() {
    const { children, style, disabled, disableKeyInteraction } = this.props
    const { x, y, scale, rotate } = this.state
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
            display: 'inline-block',
            transformOrigin: '0 0 0',
            transform: this.getTransformMatrixString(x, y, scale, rotate),
            transition: 'all 0.10s linear',
            willChange: 'transform',
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
  minZoom: 0,
  maxZoom: Infinity,
  noStateUpdate: true,
  boundaryRatioVertical: 0.8,
  boundaryRatioHorizontal: 0.8,

  preventPan: () => false,
}

export default PanZoom
