"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boundCoordinates = exports.getScaleMultiplier = exports.getTransformedBoundingBox = exports.TransformMatrix = exports.ZOOM_SPEED_MULTIPLIER = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var ZOOM_SPEED_MULTIPLIER = 0.065; // Transform matrix use to rotate, zoom and pan
// Can be written as T(centerX, centerY) * R(theta) * T(-centerX, -centerY) * S(scale, scale) + T(offsetX, offsetY)
// ( a , c, x )
// ( b , d, y )
// ( 0 , 0, 1 )

exports.ZOOM_SPEED_MULTIPLIER = ZOOM_SPEED_MULTIPLIER;

var TransformMatrix = function TransformMatrix(transformationParameters, centerCoordinates) {
  var angle = transformationParameters.angle,
      scale = transformationParameters.scale,
      offsetX = transformationParameters.offsetX,
      offsetY = transformationParameters.offsetY;
  var centerX = centerCoordinates.x,
      centerY = centerCoordinates.y;
  var theta = angle * Math.PI / 180;
  var a = Math.cos(theta) * scale;
  var b = Math.sin(theta) * scale;
  var c = -b;
  var d = a;
  var transformX = -centerX * a + centerY * b + centerX * scale;
  var transformY = centerX * c - centerY * d + centerY * scale;
  return {
    a: a,
    b: b,
    c: c,
    d: d,
    x: transformX + offsetX,
    y: transformY + offsetY
  };
};

exports.TransformMatrix = TransformMatrix;

var applyTransformMatrix = function applyTransformMatrix(transformationParameters, centerCoordinates) {
  return function (x, y) {
    var _TransformMatrix = TransformMatrix(transformationParameters, centerCoordinates),
        a = _TransformMatrix.a,
        b = _TransformMatrix.b,
        c = _TransformMatrix.c,
        d = _TransformMatrix.d,
        transformX = _TransformMatrix.x,
        transformY = _TransformMatrix.y;

    return [x * a + y * c + transformX, x * b + y * d + transformY];
  };
};

var getTransformedBoundingBox = function getTransformedBoundingBox(transformationParameters, boundingBox) {
  var top = boundingBox.top,
      left = boundingBox.left,
      width = boundingBox.width,
      height = boundingBox.height;
  var center = {
    x: width / 2,
    y: height / 2
  };
  var getTransformedCoordinates = applyTransformMatrix(transformationParameters, center);

  var _getTransformedCoordi = getTransformedCoordinates(left, top),
      _getTransformedCoordi2 = _slicedToArray(_getTransformedCoordi, 2),
      x1 = _getTransformedCoordi2[0],
      y1 = _getTransformedCoordi2[1];

  var _getTransformedCoordi3 = getTransformedCoordinates(left + width, top),
      _getTransformedCoordi4 = _slicedToArray(_getTransformedCoordi3, 2),
      x2 = _getTransformedCoordi4[0],
      y2 = _getTransformedCoordi4[1];

  var _getTransformedCoordi5 = getTransformedCoordinates(left + width, top + height),
      _getTransformedCoordi6 = _slicedToArray(_getTransformedCoordi5, 2),
      x3 = _getTransformedCoordi6[0],
      y3 = _getTransformedCoordi6[1];

  var _getTransformedCoordi7 = getTransformedCoordinates(left, top + height),
      _getTransformedCoordi8 = _slicedToArray(_getTransformedCoordi7, 2),
      x4 = _getTransformedCoordi8[0],
      y4 = _getTransformedCoordi8[1];

  return {
    top: Math.min(y1, y2, y3, y4),
    left: Math.min(x1, x2, x3, x4),
    width: Math.max(x1, x2, x3, x4) - Math.min(x1, x2, x3, x4),
    height: Math.max(y1, y2, y3, y4) - Math.min(y1, y2, y3, y4)
  };
};

exports.getTransformedBoundingBox = getTransformedBoundingBox;

var getScaleMultiplier = function getScaleMultiplier(delta) {
  var zoomSpeed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var speed = ZOOM_SPEED_MULTIPLIER * zoomSpeed;
  var scaleMultiplier = 1;

  if (delta > 0) {
    // zoom out
    scaleMultiplier = 1 - speed;
  } else if (delta < 0) {
    // zoom in
    scaleMultiplier = 1 + speed;
  }

  return scaleMultiplier;
};

exports.getScaleMultiplier = getScaleMultiplier;

var boundCoordinates = function boundCoordinates(x, y, boundaryRatio, boundingBox, containerHeight, containerWidth) {
  var offsetX = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
  var offsetY = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
  var top = boundingBox.top,
      left = boundingBox.left,
      width = boundingBox.width,
      height = boundingBox.height; // check that computed are inside boundaries otherwise set to the bounding box limits

  var boundX = left;
  var boundY = top;

  if (boundY < -boundaryRatio.vertical * height) {
    boundY = -boundaryRatio.vertical * height;
  } else if (boundY > containerHeight - (1 - boundaryRatio.vertical) * height) {
    boundY = containerHeight - (1 - boundaryRatio.vertical) * height;
  }

  if (boundX < -boundaryRatio.horizontal * width) {
    boundX = -boundaryRatio.horizontal * width;
  } else if (boundX > containerWidth - (1 - boundaryRatio.horizontal) * width) {
    boundX = containerWidth - (1 - boundaryRatio.horizontal) * width;
  } // return new bounds coordinates for the transform matrix
  // not the computed x/y coordinates


  return {
    boundX: x - (left - boundX),
    boundY: y - (top - boundY),
    offsetX: offsetX - (left - boundX),
    offsetY: offsetY - (top - boundY)
  };
};

exports.boundCoordinates = boundCoordinates;