// @flow
import * as React from 'react'

type Props = {
  zoomSpeed?: number,
  doubleZoomSpeed?: number,
  disabled?: boolean,
  autoCenter?: boolean,
  autoCenterZoomLevel?: number,
  disableKeyInteraction?: boolean,
  disableDoubleClickZoom?: Boolean,
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

// Transform matrix use to rotate, zoom and pan
// Can be written as T(centerX, centerY) * R(theta) * T(-centerX, -centerY) * S(scale, scale) + T(offsetX, offsetY)
// ( a , c, x )
// ( b , d, y )
// ( 0 , 0, 1 )
const TransformMatrix = (angle, centerX, centerY, scale, offsetX, offsetY) => {
  const theta = angle * Math.PI / 180
  const a = Math.cos(theta) * scale
  const b = Math.sin(theta) * scale
  const c = -b
  const d = a
  const transformX = - centerX * a + centerY * b + centerX * scale
  const transformY =   centerX * c - centerY * d + centerY * scale
  return { a, b, c, d, x : transformX + offsetX, y: transformY + offsetY }
}

const applyTransformMatrix = (angle, centerX, centerY, scale, offsetX, offsetY) => (x, y) => {
  const { a, b, c, d, x: transformX, y: transformY } = TransformMatrix(angle, centerX, centerY, scale, offsetX, offsetY)
  return [
    x * a + y * c + transformX,
    x * b + y * d + transformY,
  ]
}

const getTransformedElementCoordinates = (angle, scale, offsetX, offsetY) => (element) => {
  if (!element) {
    return null
  }

  const { clientTop, clientLeft, clientWidth, clientHeight } = element
  const centerX = clientWidth / 2
  const centerY = clientHeight / 2

  const _applyTransformMatrix = applyTransformMatrix(angle, centerX, centerY, scale, offsetX, offsetY)

  const [x1, y1] = _applyTransformMatrix(clientLeft, clientTop)
  const [x2, y2] = _applyTransformMatrix(clientLeft + clientWidth, clientTop)
  const [x3, y3] = _applyTransformMatrix(clientLeft + clientWidth, clientTop + clientHeight)
  const [x4, y4] = _applyTransformMatrix(clientLeft, clientTop + clientHeight)

  return {
    top: Math.min(y1, y2, y3, y4),
    left: Math.min(x1, x2, x3, x4),
    width: Math.max(x1, x2, x3, x4) - Math.min(x1, x2, x3, x4),
    height: Math.max(y1, y2, y3, y4) - Math.min(y1, y2, y3, y4),
  }
}

const preventDefault = (e) => {
  e.preventDefault()
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

    this.container.addEventListener('mousewheel', this.onWheel, { passive: false })

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

    this.container.removeEventListener('mousewheel', this.onWheel, { passive: false })
  }

  onDoubleClick = (e) => {
    const { disableDoubleClickZoom, doubleZoomSpeed } = this.props
    if (disableDoubleClickZoom) {
      return
    }
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

  captureTextSelection = () => {
    window.addEventListener('selectstart', preventDefault)
  }

  releaseTextSelection = () => {
    window.removeEventListener('selectstart', preventDefault)
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
    const containerRect = this.container.getBoundingClientRect()
    const { clientWidth, clientHeight } = this.dragContainer
    const widthRatio = containerRect.width / clientWidth
    const heightRatio = containerRect.height / clientHeight
    let scale = Math.min(widthRatio, heightRatio) * zoomLevel

    if (scale < minZoom) {
      console.warn(`[PanZoom]: initial zoomLevel produces a scale inferior to minZoom, reverted to default: ${minZoom}. Consider using a zoom level > ${minZoom}`)
      scale = minZoom
    }
    else if (scale > maxZoom) {
      console.warn(`[PanZoom]: initial zoomLevel produces a scale superior to maxZoom, reverted to default: ${maxZoom}. Consider using a zoom level < ${maxZoom}`)
      scale = maxZoom
    }

    const x = (containerRect.width - (clientWidth * scale)) / 2
    const y = (containerRect.height - (clientHeight * scale)) / 2
    this.setState({ x, y, scale, rotate: 0 })
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
      const { x: prevTransformX, y: prevTransformY } = this.getTransformMatrix(this.prevPanPosition.x, this.prevPanPosition.y, scale, rotate)
      const { a, b, c, d, x: transformX, y: transformY} = this.getTransformMatrix(this.prevPanPosition.x + dx, this.prevPanPosition.y + dy, scale, rotate)
      const { boundX, boundY, offsetX, offsetY } = this.getBoundCoordinates(transformX, transformY, scale, rotate, this.prevPanPosition.x + dx, this.prevPanPosition.y + dy)

      const intermediateX = prevTransformX + (prevTransformX - boundX) / 2
      const intermediateY = prevTransformY + (prevTransformY - boundY) / 2

      this.intermediateTransformMatrixString = this.getTransformMatrixString(a, b, c, d, intermediateX, intermediateY)
      this.transformMatrixString = this.getTransformMatrixString(a, b, c, d, boundX, boundY)

      // get bound x / y coords without the rotation offset
      this.prevPanPosition = {
        x: offsetX,
        y: offsetY,
      }

      // only apply intermediate animation if it is different from the end result
      if (this.intermediateTransformMatrixString !== this.transformMatrixString) {
        this.intermediateFrameAnimation = window.requestAnimationFrame(this.applyIntermediateTransform)
      }

      this.frameAnimation = window.requestAnimationFrame(this.applyTransform)
    }
    else {
      const { x: transformX, y: transformY} = this.getTransformMatrix(x + dx, y + dy, scale, rotate)
      const { boundX, boundY } = this.getBoundCoordinates(transformX, transformY, scale, rotate, x + dx, y + dy)

      this.setState(({
        x: x + dx - (transformX - boundX),
        y: y + dy - (transformY - boundY),
      }))
    }
  }

  rotate = (value: number | (prevAngle: number) => number) => {
    const { rotate } = this.state
    let newAngle = value
    if (typeof value === 'function') {
      newAngle = value(rotate)
    }
    this.setState({ rotate: newAngle })
  }

  zoomAbs = (x, y, zoomLevel) => {
    this.zoomTo(x, y, zoomLevel / this.state.scale)
  }

  zoomTo = (x, y, ratio) => {
    const { minZoom, maxZoom } = this.props
    const { x: transformX, y: transformY, scale, rotate } = this.state

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

    const { boundX, boundY } = this.getBoundCoordinates(newX, newY, scale, rotate, newX, newY)
    this.setState({ x: boundX, y: boundY, scale: newScale })
  }

  centeredZoom = (delta) => {
    const scaleMultiplier = this.getScaleMultiplier(delta)
    const containerRect = this.container.getBoundingClientRect()
    this.zoomTo(containerRect.width / 2, containerRect.height / 2, scaleMultiplier)
  }

  reset = () => {
    this.setState({ x: 0, y: 0, scale: 1, rotate: 0 })
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
      return { a: scale, b: 0, c: 0, d: scale, x, y }
    }

    const { clientWidth, clientHeight } = this.dragContainer
    const centerX = clientWidth / 2
    const centerY = clientHeight / 2

    return TransformMatrix(rotate, centerX, centerY, scale, x, y)
  }

  getTransformMatrixString = (a, b, c, d, x, y) => {
    return `matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})`
  }

  // Apply transform through rAF
  applyTransform = () => {
    this.dragContainer.style.transform = this.transformMatrixString
    this.frameAnimation = 0
  }

  // Apply intermediate transform through rAF
  applyIntermediateTransform = () => {
    this.dragContainer.style.transform = this.intermediateTransformMatrixString
    this.intermediateFrameAnimation = 0
  }

  getBoundCoordinates = (x, y, newScale, rotate = 0, offsetX = 0, offsetY = 0) => {
    const { enableBoundingBox, boundaryRatioVertical, boundaryRatioHorizontal } = this.props

    if (!enableBoundingBox) {
      return {
        boundX: x,
        boundY: y,
        offsetX: x,
        offsetY: y,
      }
    }

    const { height: containerHeight, width: containerWidth } = this.container.getBoundingClientRect()
    const { top, left, width, height } = getTransformedElementCoordinates(rotate, newScale, offsetX, offsetY)(this.dragContainer)

    // check that computed are inside boundaries otherwise set to the bounding box limits
    let boundX = left
    let boundY = top

    if (boundY < -boundaryRatioVertical * height) {
      boundY = -boundaryRatioVertical * height
    }
    else if (boundY > containerHeight - (1 - boundaryRatioVertical) * height) {
      boundY = containerHeight - (1 - boundaryRatioVertical) * height
    }

    if (boundX < -boundaryRatioHorizontal * width) {
      boundX = -boundaryRatioHorizontal * width
    }
    else if (boundX > containerWidth - (1 - boundaryRatioHorizontal) * width) {
      boundX = containerWidth - (1 - boundaryRatioHorizontal) * width
    }

    // return new bounds coordinates for the transform matrix
    // not the computed x/y coordinates
    return {
      boundX: x - (left - boundX),
      boundY: y - (top - boundY),
      offsetX: offsetX - (left - boundX),
      offsetY: offsetY - (top - boundY),
    }
  }

  render() {
    const { children, style, disabled, disableKeyInteraction } = this.props
    const { x, y, scale, rotate } = this.state
    const { a, b, c, d, x: transformX, y: transformY} = this.getTransformMatrix(x, y, scale, rotate)
    const transform = this.getTransformMatrixString(a, b, c, d, transformX, transformY)

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
        // React onWheel event listener is broken on Chrome 73
        // The default options for the wheel event listener has been defaulted to passive
        // but this behaviour breaks the zoom feature of PanZoom.
        // Until further research onWheel listener is replaced by
        // this.container.addEventListener('mousewheel', this.onWheel, { passive: false })
        // see Chrome motivations https://developers.google.com/web/updates/2019/02/scrolling-intervention
        //onWheel={this.onWheel}
        onKeyDown={this.onKeyDown}
        onTouchStart={this.onTouchStart}
        style={{ cursor: disabled ? 'initial' : 'pointer', ...style }}
      >
        <div
          ref={ref => this.dragContainer = ref}
          style={{
            display: 'inline-block',
            transformOrigin: '0 0 0',
            transform,
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
  disableDoubleClickZoom: false,

  preventPan: () => false,
}

export default PanZoom
