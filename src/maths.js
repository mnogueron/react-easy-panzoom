type TransformCoordinates = {
  top: number,
  left: number,
  width: number,
  height: number,
}

// Transform matrix use to rotate, zoom and pan
// Can be written as T(centerX, centerY) * R(theta) * T(-centerX, -centerY) * S(scale, scale) + T(offsetX, offsetY)
// ( a , c, x )
// ( b , d, y )
// ( 0 , 0, 1 )
export const TransformMatrix = (angle, centerX, centerY, scale, offsetX, offsetY) => {
  const theta = angle * Math.PI / 180
  const a = Math.cos(theta) * scale
  const b = Math.sin(theta) * scale
  const c = -b
  const d = a
  const transformX = - centerX * a + centerY * b + centerX * scale
  const transformY =   centerX * c - centerY * d + centerY * scale
  return { a, b, c, d, x : transformX + offsetX, y: transformY + offsetY }
}

export const applyTransformMatrix = (angle, centerX, centerY, scale, offsetX, offsetY) => (x, y) => {
  const { a, b, c, d, x: transformX, y: transformY } = TransformMatrix(angle, centerX, centerY, scale, offsetX, offsetY)
  return [
    x * a + y * c + transformX,
    x * b + y * d + transformY,
  ]
}

export const getTransformedElementCoordinates = (angle, scale, offsetX, offsetY, clientTop, clientLeft, clientWidth, clientHeight): TransformCoordinates => {
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

export const getScaleMultiplier = (delta: number, zoomSpeed: number) => {
  let speed = 0.065 * zoomSpeed
  let scaleMultiplier = 1
  if (delta > 0) { // zoom out
    scaleMultiplier = (1 - speed)
  } else if (delta < 0) { // zoom in
    scaleMultiplier = (1 + speed)
  }

  return scaleMultiplier
}

export const boundCoordinates = (
  x: number, y: number,
  boundaryRatioVertical: number, boundaryRatioHorizontal: number,
  containerHeight: number, containerWidth: number,
  top: number, left: number, width: number, height: number,
  offsetX?: number = 0, offsetY?: number = 0) => {

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
