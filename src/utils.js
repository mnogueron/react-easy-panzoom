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
