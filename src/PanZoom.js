// @flow-disabled

import * as React from 'react'
import warning from 'warning'
import { TransformMatrix, getTransformedBoundingBox, getScaleMultiplier, boundCoordinates } from './maths'
import { captureTextSelection, releaseTextSelection } from './events'

const defaultNormalizeConfig = require('./config')

/*::
  import type { Coordinates, BoundCoordinates, TransformationParameters, TransformationMatrix } from './maths'
*/

/*::
 type OnStateChangeData = {
   x: number,
   y: number,
   scale: number,
   angle: number
 }
*/

/*::
 type Props = {
   zoomSpeed: number,
   doubleZoomSpeed: number,
   disabled?: boolean,
   autoCenter?: boolean,
   autoCenterZoomLevel?: number,
   disableKeyInteraction?: boolean,
   disableDoubleClickZoom?: boolean,
   disableScrollZoom?: boolean,
   realPinch?: boolean,
   keyMapping?: { [string]: { x: number, y: number, z: number }},
   minZoom: number,
   maxZoom: number,
   preventPan: (event: SyntheticTouchEvent<HTMLDivElement> | MouseEvent, x: number, y: number) => boolean,
   noStateUpdate: boolean,
   boundaryRatioVertical: number,
   boundaryRatioHorizontal: number,
   hasNaturalScroll?: boolean,
   normalizeConfig?: {},
   debug?: boolean,

   onPanStart?: (any) => void,
   onPan?: (any) => void,
   onPanEnd?: (any) => void,
   onStateChange?: (data: OnStateChangeData) => void,
 } & React.ElementProps<'div'>
*/

/*::
  type State = {
   x: number,
   y: number,
   scale: number,
   angle: number
  }
*/

const getTransformMatrixString = (transformationMatrix /*: TransformationMatrix */) => {
  const { a, b, c, d, x, y } = transformationMatrix
  return `matrix(${a}, ${b}, ${c}, ${d}, ${x}, ${y})`
}

function clampValue(value, minAmount) {
  return Math.sign(value) * Math.min(minAmount, Math.abs(value))
}

function normalizeWheelEvent(event, hasNaturalScroll, config) {
  // Notes:
  // * Inspired by: https://danburzo.ro/dom-gestures/#unify-wheel-touch-gesture
  // * Trackpad gestures for Pan and Pinch are encoded as an WheelEvent
  // * The mouse scroll wheel will also create WheelEvents
  // * We need a way to handle both trackpad and mousewheel events for Pan gestures
  // * We need to detect when a Pinch gesture happens and treat has distinct from a normal Pan

  const {
    deltaLineMulti,
    deltaPageMulti,
    deltaPixelClamp,
    deltaPixelClampX,
    deltaPixelClampY,
  } = config
  
  let dx = event.deltaX
  let dy = event.deltaY

  // Handle horizontal scrolling with mouse wheel
  if (dx === 0 && event.shiftKey) {
    [dx, dy] = [clampValue(dy, deltaPixelClampX), dx]
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    dx *= deltaLineMulti
    dy *= deltaLineMulti
  } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    dx *= deltaPageMulti
    dy *= deltaPageMulti
  }

  const direction = hasNaturalScroll ? -1 : 1
  return [dx, clampValue(dy, deltaPixelClampY)].map(delta => delta * direction)
}

function normalizeSign(num) {
  if (Object.is(0, num)) return 0
  if (Object.is(-0, num)) return 0
  return Math.sign(num)
}

function isSimilar1DComponent(d1, d2) {
  return Object.is(d1, d2)
    || Object.is(normalizeSign(d1), normalizeSign(d2))
}

function isSimilar2DVector(prevDirection, nextDirection) {
  const [x1, y1] = prevDirection
  const [x2, y2] = nextDirection
  return isSimilar1DComponent(x1, x2) && isSimilar1DComponent(y1, y2)
}

export class PanZoom extends React.Component /* React.Component<Props,State> */ {
  static defaultProps = {
    zoomSpeed: 1,
    doubleZoomSpeed: 1.75,
    disabled: false,
    minZoom: 0,
    maxZoom: Infinity,
    noStateUpdate: true,
    boundaryRatioVertical: 0.8,
    boundaryRatioHorizontal: 0.8,
    disableDoubleClickZoom: false,
    disableScrollZoom: false,
    hasNaturalScroll: true,
    debug: false,
    normalizeConfig: defaultNormalizeConfig,
    preventPan: () => false,
  }

  container = React.createRef()
  dragContainer = React.createRef()

  mousePos = {
    x: 0,
    y: 0
  }
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

  transformMatrixString = `matrix(1, 0, 0, 1, 0, 0)`
  intermediateTransformMatrixString = `matrix(1, 0, 0, 1, 0, 0)`

  state /*: State */ = {
    x: 0,
    y: 0,
    scale: 1,
    angle: 0,
  }

  wheelTimer = null
  wheelPanning = false
  wheelZooming = false
  wheelContainerScrolling = false
  ctrlKeyPressed = false
  prevNormalizedEvent = null
  prevPanEventTimeStamp = null
  prevZoomEventTimeStamp = null
  prevScrollEventTimeStamp = null
  normalizeConfig = defaultNormalizeConfig

  clearWheelTimer = () => {
    if (this.wheelTimer) {
      clearTimeout(this.wheelTimer)
    }
  }

  componentDidMount()/*: void */ {
    const { autoCenter, autoCenterZoomLevel, minZoom, maxZoom, normalizeConfig } = this.props

    this.normalizeConfig = Object.assign({}, defaultNormalizeConfig, normalizeConfig)

    if (this.container.current) {
      this.container.current.addEventListener('wheel', this.onWheel, { passive: false })
    }

    if (maxZoom < minZoom) {
      throw new Error('[PanZoom]: maxZoom props cannot be inferior to minZoom')
    }
    if (autoCenter) {
      this.autoCenter(autoCenterZoomLevel, false)
    }
  }

  componentDidUpdate(prevProps /*: Props */, prevState /*: State */) /*: void */ {
    if (prevProps.autoCenter !== this.props.autoCenter
      && this.props.autoCenter) {
      this.autoCenter(this.props.autoCenterZoomLevel)
    }
    if (
      (prevState.x !== this.state.x
      || prevState.y !== this.state.y
      || prevState.scale !== this.state.scale
      || prevState.angle !== this.state.angle)
      && this.props.onStateChange
    ) {
      this.props.onStateChange({
        x: this.state.x,
        y: this.state.y,
        scale: this.state.scale,
        angle: this.state.angle
      })
    }
  }

  componentWillUnmount() /*: void */ {
    this.cleanMouseListeners()
    this.cleanTouchListeners()
    releaseTextSelection()
    if (this.container.current) {
      this.container.current.removeEventListener('wheel', this.onWheel, { passive: false })
    }
  }

  onDoubleClick = (e /*: MouseEvent */) => {
    const { onDoubleClick, disableDoubleClickZoom, doubleZoomSpeed } = this.props

    if (typeof onDoubleClick === 'function') {
      onDoubleClick(e)
    }

    if (disableDoubleClickZoom) {
      return
    }

    const offset = this.getOffset(e)
    this.zoomTo(offset.x, offset.y, doubleZoomSpeed)
  }

  onMouseDown = (e /*: MouseEvent */) => {
    const { preventPan, onMouseDown, noStateUpdate } = this.props

    if (typeof onMouseDown === 'function') {
      onMouseDown(e)
    }

    if (this.props.disabled) {
      return
    }

    // Touch events fire mousedown on modern browsers, but it should not
    // be considered as we will handle touch event separately
    if (this.touchInProgress) {
      e.stopPropagation()
      return false
    }

    if (this.wheelPanning) {
      this.clearWheelTimer()
      this.wheelPanning = false
      if (noStateUpdate) {
        this.setState(({ x: this.prevPanPosition.x, y: this.prevPanPosition.y }), () => {
          this.onMouseDown(e)
        })
      }
      return
    }

    const isLeftButton = ((e.button === 1 && window.event !== null) || e.button === 0)
    if (!isLeftButton) {
      return
    }

    const offset = this.getOffset(e)

    // check if there is nothing preventing the pan
    if (preventPan && preventPan(e, offset.x, offset.y)) {
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
    captureTextSelection()
  }

  onMouseMove = (e /*: MouseEvent */) => {
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

  onMouseUp = (e /*: MouseEvent */) => {
    const { noStateUpdate } = this.props

    // if using noStateUpdate we still need to set the new values in the state
    if (noStateUpdate) {
      this.setState(({ x: this.prevPanPosition.x, y: this.prevPanPosition.y }))
    }

    this.triggerOnPanEnd(e)
    this.cleanMouseListeners()
    this.panning = false
    releaseTextSelection()
  }

  resetWheelPanState = (e) => {
    const { noStateUpdate } = this.props
    if (noStateUpdate) {
      this.setState(({ x: this.prevPanPosition.x, y: this.prevPanPosition.y }))
    }

    this.triggerOnPanEnd(e)
    this.wheelPanning = false
  }

  resetWheelZoomState = (e) => {
    this.wheelZooming = false
  }

  onWheel = (e /*: WheelEvent */) => {
    const {
      disableScrollZoom,
      disabled,
      zoomSpeed,
      noStateUpdate,
      hasNaturalScroll,
      debug,
    } = this.props

    if (disabled) return

    const {
      wheelMaxZoomSpeed
    } = this.normalizeConfig

    const wheelZoomSpeed = Math.min(wheelMaxZoomSpeed, zoomSpeed)
    const normalizedEvent = normalizeWheelEvent(e, hasNaturalScroll, this.normalizeConfig)
    const [dx, dy] = normalizedEvent

    this.ctrlKeyPressed = e.ctrlKey
    const isPinchGesture = this.ctrlKeyPressed && !Number.isInteger(dy)
    const isWithinScrollable = getComputedStyle(e.target).getPropertyValue("--scrollable")
    const isHorizontalPan = (Object.is(0, dy) || Object.is(-0, dy)) && !Object.is(0, dx) 

    if (debug) {
      console.log("react-easy-panzoom state before", {
        panning: this.wheelPanning,
        zooming: this.wheelZooming,
        scrolling: this.wheelContainerScrolling
      })
    }

    if (!this.ctrlKeyPressed && this.prevZoomEventTimeStamp) {
      const diffTime = Math.abs(e.timeStamp - this.prevZoomEventTimeStamp)
      const isSimilarDirection = isSimilar2DVector(this.prevNormalizedEvent, normalizedEvent)
      if (diffTime >= this.normalizeConfig.wheelPanZoomSwapTimeout && !isSimilarDirection) {
        this.resetWheelZoomState(e)
        this.prevZoomEventTimeStamp = null

        if (isWithinScrollable) {
          e.preventDefault()

          if (!isHorizontalPan) {
            this.wheelContainerScrolling = true
            this.prevScrollEventTimeStamp = e.timeStamp
          }
        }
      }
    }

    if (this.ctrlKeyPressed && this.prevPanEventTimeStamp) {
      const diffTime = Math.abs(e.timeStamp - this.prevPanEventTimeStamp)
      const isSimilarDirection = isSimilar2DVector(this.prevNormalizedEvent, normalizedEvent)
      if (diffTime >= this.normalizeConfig.wheelPanZoomSwapTimeout && !isSimilarDirection) {
        this.resetWheelPanState(e)
        this.prevPanEventTimeStamp = null
      }
    }

    if (this.prevScrollEventTimeStamp) {
      const diffTime = Math.abs(e.timeStamp - this.prevScrollEventTimeStamp)
      const isSimilarDirection = isSimilar2DVector(this.prevNormalizedEvent, normalizedEvent)
      const isTimedOut = diffTime >= this.normalizeConfig.wheelScrollSwapTimeout
      const isTryingPan = (isHorizontalPan || !isWithinScrollable) && e.cancelable
      if ((isTimedOut && (!isSimilarDirection || isTryingPan))) {
        this.wheelContainerScrolling = false
        this.prevScrollEventTimeStamp = null
      }
    }

    if (!disableScrollZoom && this.wheelZooming && !this.wheelPanning && !this.wheelContainerScrolling && isWithinScrollable) {
      if (e.cancelable) {
        e.preventDefault()
      }
    }

    if (!disableScrollZoom && this.ctrlKeyPressed && !this.wheelPanning && !this.wheelContainerScrolling) {
      if (e.cancelable) {
        e.preventDefault()
      }

      this.wheelZooming = true
      this.prevZoomEventTimeStamp = e.timeStamp

      const scale = getScaleMultiplier(e.deltaY, wheelZoomSpeed)
      const offset = this.getOffset(e)
      this.zoomTo(offset.x, offset.y, scale)
    }

    if (!this.ctrlKeyPressed
      && !this.wheelZooming
      && !this.wheelPanning
      && isWithinScrollable
      && !isHorizontalPan) {
      this.wheelContainerScrolling = true
      this.prevScrollEventTimeStamp = e.timeStamp
    }

    if (!this.wheelZooming && !this.wheelContainerScrolling) {
      if (e.cancelable) {
        e.preventDefault()
      }

      if (!this.wheelPanning) {
        this.wheelPanning = true

        this.prevPanPosition = {
          x: this.state.x,
          y: this.state.y,
        }
      } else {
        this.prevPanEventTimeStamp = e.timeStamp
        this.triggerOnPanStart(e)
        this.moveBy(dx, dy, noStateUpdate)
        this.triggerOnPan(e)
      }
    }

    this.clearWheelTimer()
    this.wheelTimer = window.setTimeout(() => {
      if (this.wheelPanning) {
        this.resetWheelPanState(e)
      }

      if (!this.ctrlKeyPressed) {
        this.resetWheelZoomState(e)
      }
    }, this.normalizeConfig.wheelTimerTimeout)

    if (debug) {
      console.log("react-easy-panzoom state after", {
        panning: this.wheelPanning,
        zooming: this.wheelZooming,
        scrolling: this.wheelContainerScrolling
      })
      console.log("react-easy-panzoom", this.prevNormalizedEvent, normalizedEvent)
    }

    this.prevNormalizedEvent = normalizedEvent
  }

  onKeyDown = (e /*: SyntheticKeyboardEvent<HTMLDivElement> */) => {
    const { keyMapping, disableKeyInteraction, onKeyDown } = this.props

    if (typeof onKeyDown === 'function') {
        onKeyDown(e)
    }

    if (disableKeyInteraction) {
      return
    }

    const keys = {
      '38': { x: 0, y: -1, z: 0 }, // up
      '40': { x: 0, y: 1, z: 0 }, // down
      '37': { x: -1, y: 0, z: 0 }, // left
      '39': { x: 1, y: 0, z: 0 }, // right
      // '189': { x: 0, y: 0, z: 1 }, // zoom out
      // '109': { x: 0, y: 0, z: 1 }, // zoom out
      // '187': { x: 0, y: 0, z: -1 }, // zoom in
      // '107': { x: 0, y: 0, z: -1 }, // zoom in
      ...keyMapping,
    }

    const mappedCoords = keys[e.keyCode]
    if (mappedCoords) {
      const { x, y, z } = mappedCoords
      e.preventDefault()
      e.stopPropagation()

      if ((x || y) && this.container.current) {
        const containerRect = this.container.current.getBoundingClientRect()
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

  onKeyUp = (e /*: SyntheticKeyboardEvent<HTMLDivElement> */) => {
    const { disableKeyInteraction, onKeyDown } = this.props

    if (typeof onKeyDown === 'function') {
        onKeyDown(e)
    }

    if (disableKeyInteraction) {
      return
    }

    if (this.prevPanPosition && (this.prevPanPosition.x !== this.state.x || this.prevPanPosition.y !== this.state.y)) {
      this.setState({ x: this.prevPanPosition.x, y: this.prevPanPosition.y })
    }
  }

  onTouchStart = (e /*: SyntheticTouchEvent<HTMLDivElement> */) => {
    const { preventPan, onTouchStart, disabled } = this.props
    if (typeof onTouchStart === 'function') {
      onTouchStart(e)
    }
    
    if (disabled) {
      return
    }

    if (this.wheelPanning) {
      this.clearWheelTimer()
      this.wheelPanning = false
    }

    if (this.wheelZooming) {
      this.clearWheelTimer()
      this.wheelZooming = false
      this.ctrlKeyPressed = false
    }

    if (e.touches.length === 1) {
      // Drag
      const touch = e.touches[0]
      const offset = this.getOffset(touch)

      if (preventPan && preventPan(e, offset.x, offset.y)) {
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

  onToucheMove = (e /*: TouchEvent */) => {
    const { realPinch, noStateUpdate, zoomSpeed } = this.props
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
        scaleMultiplier = getScaleMultiplier(delta, zoomSpeed)
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

  onTouchEnd = (e /*: TouchEvent */) => {
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
      const { noStateUpdate } = this.props
      if (noStateUpdate) {
        this.setState(({ x: this.prevPanPosition.x, y: this.prevPanPosition.y }))
      }

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

  triggerOnPanStart = (e /*: MouseEvent | TouchEvent */) => {
    const { onPanStart } = this.props
    if (!this.panStartTriggered && onPanStart && typeof onPanStart === 'function') {
      onPanStart(e)
    }
    this.panStartTriggered = true
  }

  triggerOnPan = (e /*: MouseEvent | TouchEvent */) => {
    const { onPan } = this.props
    if (typeof onPan === 'function') {
      onPan(e)
    }
  }

  triggerOnPanEnd = (e /*: MouseEvent | TouchEvent */) => {
    const { onPanEnd } = this.props
    this.panStartTriggered = false
    if (typeof onPanEnd === 'function') {
      onPanEnd(e)
    }
  }

  getPinchZoomLength = (finger1 /*: Touch */, finger2 /*: Touch */) /*: number */ => {
    return Math.sqrt(
      (finger1.clientX - finger2.clientX) * (finger1.clientX - finger2.clientX) +
      (finger1.clientY - finger2.clientY) * (finger1.clientY - finger2.clientY)
    )
  }

  getContainer = () /*: HTMLDivElement */ => {
    const { current: container } = this.container
    if (!container) {
      throw new Error("Could not find container DOM element.")
    }
    return container
  }

  getDragContainer = () /*: HTMLDivElement */ => {
    const { current: dragContainer } = this.dragContainer
    if (!dragContainer) {
      throw new Error("Could not find dragContainer DOM element.")
    }
    return dragContainer
  }

  autoCenter = (zoomLevel /*: number */ = 1, animate /*: boolean */ = true) => {
    const container = this.getContainer()
    const dragContainer = this.getDragContainer()
    const { minZoom, maxZoom } = this.props
    const containerRect = container.getBoundingClientRect()
    const { clientWidth, clientHeight } = dragContainer
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
    
    let afterStateUpdate = undefined
    if (!animate) {
      const transition = dragContainer.style.transition
      dragContainer.style.transition = "none"
      afterStateUpdate = () => {
        setTimeout(() => { 
          const dragContainer = this.getDragContainer()
          dragContainer.style.transition = transition
        }, 0)
      }
    }

    this.prevPanPosition = { x, y }
    this.setState({ x, y, scale, angle: 0 }, afterStateUpdate)
  }

  moveByRatio = (x /*: number */, y /*: number */, moveSpeedRatio /*: number */ = 0.05) => {
    const container = this.getContainer()
    const containerRect = container.getBoundingClientRect()
    const offset = Math.min(containerRect.width, containerRect.height)
    const dx = offset * moveSpeedRatio * x
    const dy = offset * moveSpeedRatio * y

    this.moveBy(dx, dy, false)
  }

  moveBy = (dx /*: number */, dy /*: number */, noStateUpdate /*?: boolean */ = true) => {
    const { x, y, scale, angle } = this.state

    // Allow better performance by not updating the state on every change
    if (noStateUpdate) {
      const { x: prevTransformX, y: prevTransformY } = this.getTransformMatrix(this.prevPanPosition.x, this.prevPanPosition.y, scale, angle)
      const { a, b, c, d, x: transformX, y: transformY} = this.getTransformMatrix(this.prevPanPosition.x + dx, this.prevPanPosition.y + dy, scale, angle)
      const { boundX, boundY, offsetX, offsetY } = this.getBoundCoordinates({x: transformX, y: transformY }, { angle, scale, offsetX: this.prevPanPosition.x + dx, offsetY: this.prevPanPosition.y + dy })

      const intermediateX = prevTransformX + (prevTransformX - boundX) / 2
      const intermediateY = prevTransformY + (prevTransformY - boundY) / 2

      this.intermediateTransformMatrixString = getTransformMatrixString({ a, b, c, d, x: intermediateX, y: intermediateY })
      this.transformMatrixString = getTransformMatrixString({ a, b, c, d, x: boundX, y: boundY })

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
      const { x: transformX, y: transformY} = this.getTransformMatrix(x + dx, y + dy, scale, angle)
      const { boundX, boundY } = this.getBoundCoordinates({ x: transformX, y: transformY }, { angle, scale, offsetX: x + dx, offsetY: y + dy })

      this.setState(({
        x: x + dx - (transformX - boundX),
        y: y + dy - (transformY - boundY),
      }))
    }
  }

  rotate = (value /*: number | (prevAngle: number) => number */) => {
    const { angle } = this.state
    let newAngle /*: number */
    if (typeof value === 'function') {
      newAngle = value(angle)
    } else {
      newAngle = value
    }
    this.setState({ angle: newAngle })
  }

  zoomAbs = (x /*: number */, y /*: number */, zoomLevel /*: number */) => {
    this.zoomTo(x, y, zoomLevel / this.state.scale)
  }

  zoomTo = (x /*: number */, y /*: number */, ratio /*: number */) => {
    const { minZoom, maxZoom } = this.props
    const { x: transformX, y: transformY, scale, angle } = this.state

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

    const { boundX, boundY } = this.getBoundCoordinates({ x: newX, y: newY }, { angle, scale, offsetX: newX, offsetY: newY })
    this.prevPanPosition = { x: boundX, y: boundY }
    this.setState({ x: boundX, y: boundY, scale: newScale })
  }

  centeredZoom = (delta /*: number */, zoomSpeed /*?: number */) => {
    const container = this.getContainer()
    const scaleMultiplier = getScaleMultiplier(delta, zoomSpeed || this.props.zoomSpeed)
    const containerRect = container.getBoundingClientRect()
    this.zoomTo(containerRect.width / 2, containerRect.height / 2, scaleMultiplier)
  }

  zoomIn = (zoomSpeed /*?: number */) => {
    this.centeredZoom(-1, zoomSpeed)
  }

  zoomOut = (zoomSpeed /*?: number */) => {
    this.centeredZoom(1, zoomSpeed)
  }

  reset = () => {
    this.setState({ x: 0, y: 0, scale: 1, angle: 0 })
  }

  getContainerBoundingRect = () /*: ClientRect */ => {
    return this.getContainer().getBoundingClientRect()
  }

  getOffset = (e /*: MouseEvent | Touch */) /*: Coordinates */ => {
    const containerRect = this.getContainerBoundingRect()
    const offsetX = e.clientX - containerRect.left
    const offsetY = e.clientY - containerRect.top
    return { x: offsetX, y: offsetY }
  }

  getTransformMatrix = (x /*: number */, y /*: number */, scale /*: number */, angle /*: number */) /*: TransformationMatrix */ => {
    if (!this.dragContainer.current) {
      return { a: scale, b: 0, c: 0, d: scale, x, y }
    }

    const { clientWidth, clientHeight } = this.getDragContainer()
    const centerX = clientWidth / 2
    const centerY = clientHeight / 2

    return TransformMatrix({ angle, scale, offsetX: x, offsetY: y }, { x: centerX, y: centerY })
  }

  // Apply transform through rAF
  applyTransform = () => {
    this.getDragContainer().style.transform = this.transformMatrixString
    this.frameAnimation = 0
  }

  // Apply intermediate transform through rAF
  applyIntermediateTransform = () => {
    this.getDragContainer().style.transform = this.intermediateTransformMatrixString
    this.intermediateFrameAnimation = 0
  }

  getBoundCoordinates = (coordinates /*: Coordinates */, transformationParameters /*: TransformationParameters */) /*: BoundCoordinates */ => {
    const { x, y } = coordinates
    const { enableBoundingBox, boundaryRatioVertical, boundaryRatioHorizontal } = this.props
    const { offsetX = 0, offsetY = 0 } = transformationParameters

    if (!enableBoundingBox) {
      return {
        boundX: x,
        boundY: y,
        offsetX: x,
        offsetY: y,
      }
    }

    const { height: containerHeight, width: containerWidth } = this.getContainerBoundingRect()
    const { clientTop, clientLeft, clientWidth, clientHeight } = this.getDragContainer()
    const clientBoundingBox = { top: clientTop, left: clientLeft, width: clientWidth, height: clientHeight }

    return boundCoordinates(x, y,
      { vertical: boundaryRatioVertical, horizontal: boundaryRatioHorizontal },
      getTransformedBoundingBox(transformationParameters, clientBoundingBox),
      containerHeight, containerWidth,
      offsetX, offsetY)
  }

  render() {
    const {
      children,
      autoCenter,
      autoCenterZoomLevel,
      zoomSpeed,
      doubleZoomSpeed,
      disabled,
      disableDoubleClickZoom,
      disableScrollZoom,
      disableKeyInteraction,
      realPinch,
      keyMapping,
      minZoom,
      maxZoom,
      enableBoundingBox,
      boundaryRatioVertical,
      boundaryRatioHorizontal,
      noStateUpdate,
      onPanStart,
      onPan,
      onPanEnd,
      preventPan,
      style,
      onDoubleClick,
      onMouseDown,
      onKeyDown,
      onKeyUp,
      onTouchStart,
      onStateChange,
      hasNaturalScroll,
      normalizeConfig,
      debug,
      ...restPassThroughProps
    } = this.props
    const { x, y, scale, angle } = this.state
    const transform = getTransformMatrixString(this.getTransformMatrix(x, y, scale, angle))

    if (process.env.NODE_ENV !== 'production') {
      warning(
        onDoubleClick === undefined || typeof onDoubleClick === 'function',
        "Expected `onDoubleClick` listener to be a function, instead got a value of `%s` type.",
        typeof onDoubleClick
      )
      warning(
        onMouseDown === undefined || typeof onMouseDown === 'function',
        "Expected `onMouseDown` listener to be a function, instead got a value of `%s` type.",
        typeof onMouseDown
      )
      warning(
        onKeyDown === undefined || typeof onKeyDown === 'function',
        "Expected `onKeyDown` listener to be a function, instead got a value of `%s` type.",
        typeof onKeyDown
      )
      warning(
        onKeyUp === undefined || typeof onKeyUp === 'function',
        "Expected `onKeyUp` listener to be a function, instead got a value of `%s` type.",
        typeof onKeyUp
      )
      warning(
        onTouchStart === undefined || typeof onTouchStart === 'function',
        "Expected `onTouchStart` listener to be a function, instead got a value of `%s` type.",
        typeof onTouchStart
      )
    }

    return React.createElement(
      'div',
      Object.assign({
        ref: this.container,
        onDoubleClick: this.onDoubleClick,
        onMouseDown: this.onMouseDown,

        // React onWheel event listener is broken on Chrome 73
        // The default options for the wheel event listener has been defaulted to passive
        // but this behaviour breaks the zoom feature of PanZoom.
        // Until further research onWheel listener is replaced by
        // this.container.addEventListener('mousewheel', this.onWheel, { passive: false })
        // see Chrome motivations https://developers.google.com/web/updates/2019/02/scrolling-intervention
        // onWheel: this.onWheel

        onKeyDown: this.onKeyDown,
        onKeyUp: this.onKeyUp,
        onTouchStart: this.onTouchStart,
        style: {
          cursor: disabled ? 'initial' : 'pointer',
          ...style
        },
      },
      disableKeyInteraction ? {} : { tabIndex: 0 },
      restPassThroughProps),

      React.createElement(
        'div',
        {
          ref: this.dragContainer,
          style: {
            display: 'inline-block',
            transformOrigin: '0 0 0',
            transform,
            transition: 'all 0.10s linear',
            willChange: 'transform',
          }
        },
        children))
  }
}

export default PanZoom
