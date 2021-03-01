"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var React = _interopRequireWildcard(require("react"));

var _warning = _interopRequireDefault(require("warning"));

var _maths = require("./maths");

var _events = require("./events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getTransformMatrixString = function getTransformMatrixString(transformationMatrix) {
  var a = transformationMatrix.a,
      b = transformationMatrix.b,
      c = transformationMatrix.c,
      d = transformationMatrix.d,
      x = transformationMatrix.x,
      y = transformationMatrix.y;
  return "matrix(".concat(a, ", ").concat(b, ", ").concat(c, ", ").concat(d, ", ").concat(x, ", ").concat(y, ")");
};

var PanZoom = /*#__PURE__*/function (_React$Component) {
  _inherits(PanZoom, _React$Component);

  var _super = _createSuper(PanZoom);

  function PanZoom() {
    var _this;

    _classCallCheck(this, PanZoom);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "container", /*#__PURE__*/React.createRef());

    _defineProperty(_assertThisInitialized(_this), "dragContainer", /*#__PURE__*/React.createRef());

    _defineProperty(_assertThisInitialized(_this), "mousePos", {
      x: 0,
      y: 0
    });

    _defineProperty(_assertThisInitialized(_this), "panning", false);

    _defineProperty(_assertThisInitialized(_this), "touchInProgress", false);

    _defineProperty(_assertThisInitialized(_this), "panStartTriggered", false);

    _defineProperty(_assertThisInitialized(_this), "pinchZoomLength", 0);

    _defineProperty(_assertThisInitialized(_this), "prevPanPosition", {
      x: 0,
      y: 0
    });

    _defineProperty(_assertThisInitialized(_this), "frameAnimation", null);

    _defineProperty(_assertThisInitialized(_this), "intermediateFrameAnimation", null);

    _defineProperty(_assertThisInitialized(_this), "transformMatrixString", "matrix(1, 0, 0, 1, 0, 0)");

    _defineProperty(_assertThisInitialized(_this), "intermediateTransformMatrixString", "matrix(1, 0, 0, 1, 0, 0)");

    _defineProperty(_assertThisInitialized(_this), "state", {
      x: 0,
      y: 0,
      scale: 1,
      angle: 0
    });

    _defineProperty(_assertThisInitialized(_this), "onDoubleClick", function (e) {
      var _this$props = _this.props,
          onDoubleClick = _this$props.onDoubleClick,
          disableDoubleClickZoom = _this$props.disableDoubleClickZoom,
          doubleZoomSpeed = _this$props.doubleZoomSpeed;

      if (typeof onDoubleClick === 'function') {
        onDoubleClick(e);
      }

      if (disableDoubleClickZoom) {
        return;
      }

      var offset = _this.getOffset(e);

      _this.zoomTo(offset.x, offset.y, doubleZoomSpeed);
    });

    _defineProperty(_assertThisInitialized(_this), "onMouseDown", function (e) {
      var _this$props2 = _this.props,
          preventPan = _this$props2.preventPan,
          onMouseDown = _this$props2.onMouseDown;

      if (typeof onMouseDown === 'function') {
        onMouseDown(e);
      }

      if (_this.props.disabled) {
        return;
      } // Touch events fire mousedown on modern browsers, but it should not
      // be considered as we will handle touch event separately


      if (_this.touchInProgress) {
        e.stopPropagation();
        return false;
      }

      var isLeftButton = e.button === 1 && window.event !== null || e.button === 0;

      if (!isLeftButton) {
        return;
      }

      var offset = _this.getOffset(e); // check if there is nothing preventing the pan


      if (preventPan && preventPan(e, offset.x, offset.y)) {
        return;
      }

      _this.mousePos = {
        x: offset.x,
        y: offset.y
      }; // keep the current pan value in memory to allow noStateUpdate panning

      _this.prevPanPosition = {
        x: _this.state.x,
        y: _this.state.y
      };
      _this.panning = true;

      _this.setMouseListeners(); // Prevent text selection


      (0, _events.captureTextSelection)();
    });

    _defineProperty(_assertThisInitialized(_this), "onMouseMove", function (e) {
      if (_this.panning) {
        var noStateUpdate = _this.props.noStateUpdate; // TODO disable if using touch event

        _this.triggerOnPanStart(e);

        var offset = _this.getOffset(e);

        var dx = offset.x - _this.mousePos.x;
        var dy = offset.y - _this.mousePos.y;
        _this.mousePos = {
          x: offset.x,
          y: offset.y
        };

        _this.moveBy(dx, dy, noStateUpdate);

        _this.triggerOnPan(e);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onMouseUp", function (e) {
      var noStateUpdate = _this.props.noStateUpdate; // if using noStateUpdate we still need to set the new values in the state

      if (noStateUpdate) {
        _this.setState({
          x: _this.prevPanPosition.x,
          y: _this.prevPanPosition.y
        });
      }

      _this.triggerOnPanEnd(e);

      _this.cleanMouseListeners();

      _this.panning = false;
      (0, _events.releaseTextSelection)();
    });

    _defineProperty(_assertThisInitialized(_this), "onWheel", function (e) {
      var _this$props3 = _this.props,
          disableScrollZoom = _this$props3.disableScrollZoom,
          disabled = _this$props3.disabled,
          zoomSpeed = _this$props3.zoomSpeed;

      if (disableScrollZoom || disabled) {
        return;
      }

      var scale = (0, _maths.getScaleMultiplier)(e.deltaY, zoomSpeed);

      var offset = _this.getOffset(e);

      _this.zoomTo(offset.x, offset.y, scale);

      e.preventDefault();
    });

    _defineProperty(_assertThisInitialized(_this), "onKeyDown", function (e) {
      var _this$props4 = _this.props,
          keyMapping = _this$props4.keyMapping,
          disableKeyInteraction = _this$props4.disableKeyInteraction,
          onKeyDown = _this$props4.onKeyDown;

      if (typeof onKeyDown === 'function') {
        onKeyDown(e);
      }

      if (disableKeyInteraction) {
        return;
      }

      var keys = _objectSpread({
        '38': {
          x: 0,
          y: -1,
          z: 0
        },
        // up
        '40': {
          x: 0,
          y: 1,
          z: 0
        },
        // down
        '37': {
          x: -1,
          y: 0,
          z: 0
        },
        // left
        '39': {
          x: 1,
          y: 0,
          z: 0
        },
        // right
        '189': {
          x: 0,
          y: 0,
          z: 1
        },
        // zoom out
        '109': {
          x: 0,
          y: 0,
          z: 1
        },
        // zoom out
        '187': {
          x: 0,
          y: 0,
          z: -1
        },
        // zoom in
        '107': {
          x: 0,
          y: 0,
          z: -1
        }
      }, keyMapping);

      var mappedCoords = keys[e.keyCode];

      if (mappedCoords) {
        var _x = mappedCoords.x,
            _y = mappedCoords.y,
            z = mappedCoords.z;
        e.preventDefault();
        e.stopPropagation();

        if ((_x || _y) && _this.container.current) {
          var containerRect = _this.container.current.getBoundingClientRect();

          var offset = Math.min(containerRect.width, containerRect.height);
          var moveSpeedRatio = 0.05;
          var dx = offset * moveSpeedRatio * _x;
          var dy = offset * moveSpeedRatio * _y;

          _this.moveBy(dx, dy);
        }

        if (z) {
          _this.centeredZoom(z);
        }
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onKeyUp", function (e) {
      var _this$props5 = _this.props,
          disableKeyInteraction = _this$props5.disableKeyInteraction,
          onKeyDown = _this$props5.onKeyDown;

      if (typeof onKeyDown === 'function') {
        onKeyDown(e);
      }

      if (disableKeyInteraction) {
        return;
      }

      if (_this.prevPanPosition && (_this.prevPanPosition.x !== _this.state.x || _this.prevPanPosition.y !== _this.state.y)) {
        _this.setState({
          x: _this.prevPanPosition.x,
          y: _this.prevPanPosition.y
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onTouchStart", function (e) {
      var _this$props6 = _this.props,
          preventPan = _this$props6.preventPan,
          onTouchStart = _this$props6.onTouchStart,
          disabled = _this$props6.disabled;

      if (typeof onTouchStart === 'function') {
        onTouchStart(e);
      }

      if (disabled) {
        return;
      }

      if (e.touches.length === 1) {
        // Drag
        var touch = e.touches[0];

        var offset = _this.getOffset(touch);

        if (preventPan && preventPan(e, offset.x, offset.y)) {
          return;
        }

        _this.mousePos = {
          x: offset.x,
          y: offset.y
        }; // keep the current pan value in memory to allow noStateUpdate panning

        _this.prevPanPosition = {
          x: _this.state.x,
          y: _this.state.y
        };
        _this.touchInProgress = true;

        _this.setTouchListeners();
      } else if (e.touches.length === 2) {
        // pinch
        _this.pinchZoomLength = _this.getPinchZoomLength(e.touches[0], e.touches[1]);
        _this.touchInProgress = true;

        _this.setTouchListeners();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onToucheMove", function (e) {
      var _this$props7 = _this.props,
          realPinch = _this$props7.realPinch,
          noStateUpdate = _this$props7.noStateUpdate,
          zoomSpeed = _this$props7.zoomSpeed;

      if (e.touches.length === 1) {
        e.stopPropagation();
        var touch = e.touches[0];

        var offset = _this.getOffset(touch);

        var dx = offset.x - _this.mousePos.x;
        var dy = offset.y - _this.mousePos.y;

        if (dx !== 0 || dy !== 0) {
          _this.triggerOnPanStart(e);
        }

        _this.mousePos = {
          x: offset.x,
          y: offset.y
        };

        _this.moveBy(dx, dy, noStateUpdate);

        _this.triggerOnPan(e);
      } else if (e.touches.length === 2) {
        var finger1 = e.touches[0];
        var finger2 = e.touches[1];

        var currentPinZoomLength = _this.getPinchZoomLength(finger1, finger2);

        var scaleMultiplier = 1;

        if (realPinch) {
          scaleMultiplier = currentPinZoomLength / _this.pinchZoomLength;
        } else {
          var delta = 0;

          if (currentPinZoomLength < _this.pinchZoomLength) {
            delta = 1;
          } else if (currentPinZoomLength > _this.pinchZoomLength) {
            delta = -1;
          }

          scaleMultiplier = (0, _maths.getScaleMultiplier)(delta, zoomSpeed);
        }

        _this.mousePos = {
          x: (finger1.clientX + finger2.clientX) / 2,
          y: (finger1.clientY + finger2.clientY) / 2
        };

        _this.zoomTo(_this.mousePos.x, _this.mousePos.y, scaleMultiplier);

        _this.pinchZoomLength = currentPinZoomLength;
        e.stopPropagation();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "onTouchEnd", function (e) {
      if (e.touches.length > 0) {
        var offset = _this.getOffset(e.touches[0]);

        _this.mousePos = {
          x: offset.x,
          y: offset.y
        }; // when removing a finger we don't go through onTouchStart
        // thus we need to set the prevPanPosition here

        _this.prevPanPosition = {
          x: _this.state.x,
          y: _this.state.y
        };
      } else {
        var noStateUpdate = _this.props.noStateUpdate;

        if (noStateUpdate) {
          _this.setState({
            x: _this.prevPanPosition.x,
            y: _this.prevPanPosition.y
          });
        }

        _this.touchInProgress = false;

        _this.triggerOnPanEnd(e);

        _this.cleanTouchListeners();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "setMouseListeners", function () {
      document.addEventListener('mousemove', _this.onMouseMove);
      document.addEventListener('mouseup', _this.onMouseUp);
    });

    _defineProperty(_assertThisInitialized(_this), "cleanMouseListeners", function () {
      document.removeEventListener('mousemove', _this.onMouseMove);
      document.removeEventListener('mouseup', _this.onMouseUp);

      if (_this.frameAnimation) {
        window.cancelAnimationFrame(_this.frameAnimation);
        _this.frameAnimation = 0;
      }

      if (_this.intermediateFrameAnimation) {
        window.cancelAnimationFrame(_this.intermediateFrameAnimation);
        _this.intermediateFrameAnimation = 0;
      }
    });

    _defineProperty(_assertThisInitialized(_this), "setTouchListeners", function () {
      document.addEventListener('touchmove', _this.onToucheMove);
      document.addEventListener('touchend', _this.onTouchEnd);
      document.addEventListener('touchcancel', _this.onTouchEnd);
    });

    _defineProperty(_assertThisInitialized(_this), "cleanTouchListeners", function () {
      document.removeEventListener('touchmove', _this.onToucheMove);
      document.removeEventListener('touchend', _this.onTouchEnd);
      document.removeEventListener('touchcancel', _this.onTouchEnd);

      if (_this.frameAnimation) {
        window.cancelAnimationFrame(_this.frameAnimation);
        _this.frameAnimation = 0;
      }

      if (_this.intermediateFrameAnimation) {
        window.cancelAnimationFrame(_this.intermediateFrameAnimation);
        _this.intermediateFrameAnimation = 0;
      }
    });

    _defineProperty(_assertThisInitialized(_this), "triggerOnPanStart", function (e) {
      var onPanStart = _this.props.onPanStart;

      if (!_this.panStartTriggered && onPanStart && typeof onPanStart === 'function') {
        onPanStart(e);
      }

      _this.panStartTriggered = true;
    });

    _defineProperty(_assertThisInitialized(_this), "triggerOnPan", function (e) {
      var onPan = _this.props.onPan;

      if (typeof onPan === 'function') {
        onPan(e);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "triggerOnPanEnd", function (e) {
      var onPanEnd = _this.props.onPanEnd;
      _this.panStartTriggered = false;

      if (typeof onPanEnd === 'function') {
        onPanEnd(e);
      }
    });

    _defineProperty(_assertThisInitialized(_this), "getPinchZoomLength", function (finger1, finger2) {
      return Math.sqrt((finger1.clientX - finger2.clientX) * (finger1.clientX - finger2.clientX) + (finger1.clientY - finger2.clientY) * (finger1.clientY - finger2.clientY));
    });

    _defineProperty(_assertThisInitialized(_this), "getContainer", function () {
      var container = _this.container.current;

      if (!container) {
        throw new Error("Could not find container DOM element.");
      }

      return container;
    });

    _defineProperty(_assertThisInitialized(_this), "getDragContainer", function () {
      var dragContainer = _this.dragContainer.current;

      if (!dragContainer) {
        throw new Error("Could not find dragContainer DOM element.");
      }

      return dragContainer;
    });

    _defineProperty(_assertThisInitialized(_this), "autoCenter", function () {
      var zoomLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var animate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      var container = _this.getContainer();

      var dragContainer = _this.getDragContainer();

      var _this$props8 = _this.props,
          minZoom = _this$props8.minZoom,
          maxZoom = _this$props8.maxZoom;
      var containerRect = container.getBoundingClientRect();
      var clientWidth = dragContainer.clientWidth,
          clientHeight = dragContainer.clientHeight;
      var widthRatio = containerRect.width / clientWidth;
      var heightRatio = containerRect.height / clientHeight;
      var scale = Math.min(widthRatio, heightRatio) * zoomLevel;

      if (scale < minZoom) {
        console.warn("[PanZoom]: initial zoomLevel produces a scale inferior to minZoom, reverted to default: ".concat(minZoom, ". Consider using a zoom level > ").concat(minZoom));
        scale = minZoom;
      } else if (scale > maxZoom) {
        console.warn("[PanZoom]: initial zoomLevel produces a scale superior to maxZoom, reverted to default: ".concat(maxZoom, ". Consider using a zoom level < ").concat(maxZoom));
        scale = maxZoom;
      }

      var x = (containerRect.width - clientWidth * scale) / 2;
      var y = (containerRect.height - clientHeight * scale) / 2;
      var afterStateUpdate = undefined;

      if (!animate) {
        var transition = dragContainer.style.transition;
        dragContainer.style.transition = "none";

        afterStateUpdate = function afterStateUpdate() {
          setTimeout(function () {
            var dragContainer = _this.getDragContainer();

            dragContainer.style.transition = transition;
          }, 0);
        };
      }

      _this.prevPanPosition = {
        x: x,
        y: y
      };

      _this.setState({
        x: x,
        y: y,
        scale: scale,
        angle: 0
      }, afterStateUpdate);
    });

    _defineProperty(_assertThisInitialized(_this), "moveByRatio", function (x, y) {
      var moveSpeedRatio = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.05;

      var container = _this.getContainer();

      var containerRect = container.getBoundingClientRect();
      var offset = Math.min(containerRect.width, containerRect.height);
      var dx = offset * moveSpeedRatio * x;
      var dy = offset * moveSpeedRatio * y;

      _this.moveBy(dx, dy, false);
    });

    _defineProperty(_assertThisInitialized(_this), "moveBy", function (dx, dy) {
      var noStateUpdate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var _this$state = _this.state,
          x = _this$state.x,
          y = _this$state.y,
          scale = _this$state.scale,
          angle = _this$state.angle; // Allow better performance by not updating the state on every change

      if (noStateUpdate) {
        var _this$getTransformMat = _this.getTransformMatrix(_this.prevPanPosition.x, _this.prevPanPosition.y, scale, angle),
            prevTransformX = _this$getTransformMat.x,
            prevTransformY = _this$getTransformMat.y;

        var _this$getTransformMat2 = _this.getTransformMatrix(_this.prevPanPosition.x + dx, _this.prevPanPosition.y + dy, scale, angle),
            a = _this$getTransformMat2.a,
            b = _this$getTransformMat2.b,
            c = _this$getTransformMat2.c,
            d = _this$getTransformMat2.d,
            transformX = _this$getTransformMat2.x,
            transformY = _this$getTransformMat2.y;

        var _this$getBoundCoordin = _this.getBoundCoordinates({
          x: transformX,
          y: transformY
        }, {
          angle: angle,
          scale: scale,
          offsetX: _this.prevPanPosition.x + dx,
          offsetY: _this.prevPanPosition.y + dy
        }),
            boundX = _this$getBoundCoordin.boundX,
            boundY = _this$getBoundCoordin.boundY,
            offsetX = _this$getBoundCoordin.offsetX,
            offsetY = _this$getBoundCoordin.offsetY;

        var intermediateX = prevTransformX + (prevTransformX - boundX) / 2;
        var intermediateY = prevTransformY + (prevTransformY - boundY) / 2;
        _this.intermediateTransformMatrixString = getTransformMatrixString({
          a: a,
          b: b,
          c: c,
          d: d,
          x: intermediateX,
          y: intermediateY
        });
        _this.transformMatrixString = getTransformMatrixString({
          a: a,
          b: b,
          c: c,
          d: d,
          x: boundX,
          y: boundY
        }); // get bound x / y coords without the rotation offset

        _this.prevPanPosition = {
          x: offsetX,
          y: offsetY
        }; // only apply intermediate animation if it is different from the end result

        if (_this.intermediateTransformMatrixString !== _this.transformMatrixString) {
          _this.intermediateFrameAnimation = window.requestAnimationFrame(_this.applyIntermediateTransform);
        }

        _this.frameAnimation = window.requestAnimationFrame(_this.applyTransform);
      } else {
        var _this$getTransformMat3 = _this.getTransformMatrix(x + dx, y + dy, scale, angle),
            _transformX = _this$getTransformMat3.x,
            _transformY = _this$getTransformMat3.y;

        var _this$getBoundCoordin2 = _this.getBoundCoordinates({
          x: _transformX,
          y: _transformY
        }, {
          angle: angle,
          scale: scale,
          offsetX: x + dx,
          offsetY: y + dy
        }),
            _boundX = _this$getBoundCoordin2.boundX,
            _boundY = _this$getBoundCoordin2.boundY;

        _this.setState({
          x: x + dx - (_transformX - _boundX),
          y: y + dy - (_transformY - _boundY)
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "rotate", function (value) {
      var angle = _this.state.angle;
      var newAngle;

      if (typeof value === 'function') {
        newAngle = value(angle);
      } else {
        newAngle = value;
      }

      _this.setState({
        angle: newAngle
      });
    });

    _defineProperty(_assertThisInitialized(_this), "setZoom", function (value) {
      _this.setState({
        scale: value
      });
    });

    _defineProperty(_assertThisInitialized(_this), "zoomAbs", function (x, y, zoomLevel) {
      _this.zoomTo(x, y, zoomLevel / _this.state.scale);
    });

    _defineProperty(_assertThisInitialized(_this), "zoomTo", function (x, y, ratio) {
      var _this$props9 = _this.props,
          minZoom = _this$props9.minZoom,
          maxZoom = _this$props9.maxZoom;
      var _this$state2 = _this.state,
          transformX = _this$state2.x,
          transformY = _this$state2.y,
          scale = _this$state2.scale,
          angle = _this$state2.angle;
      var newScale = scale * ratio;

      if (newScale < minZoom) {
        if (scale === minZoom) {
          return;
        }

        ratio = minZoom / scale;
        newScale = minZoom;
      } else if (newScale > maxZoom) {
        if (scale === maxZoom) {
          return;
        }

        ratio = maxZoom / scale;
        newScale = maxZoom;
      }

      var newX = x - ratio * (x - transformX);
      var newY = y - ratio * (y - transformY);

      var _this$getBoundCoordin3 = _this.getBoundCoordinates({
        x: newX,
        y: newY
      }, {
        angle: angle,
        scale: scale,
        offsetX: newX,
        offsetY: newY
      }),
          boundX = _this$getBoundCoordin3.boundX,
          boundY = _this$getBoundCoordin3.boundY;

      _this.prevPanPosition = {
        x: boundX,
        y: boundY
      };

      _this.setState({
        x: boundX,
        y: boundY,
        scale: newScale
      });
    });

    _defineProperty(_assertThisInitialized(_this), "centeredZoom", function (delta, zoomSpeed) {
      var container = _this.getContainer();

      var scaleMultiplier = (0, _maths.getScaleMultiplier)(delta, zoomSpeed || _this.props.zoomSpeed);
      var containerRect = container.getBoundingClientRect();

      _this.zoomTo(containerRect.width / 2, containerRect.height / 2, scaleMultiplier);
    });

    _defineProperty(_assertThisInitialized(_this), "zoomIn", function (zoomSpeed) {
      _this.centeredZoom(-1, zoomSpeed);
    });

    _defineProperty(_assertThisInitialized(_this), "zoomOut", function (zoomSpeed) {
      _this.centeredZoom(1, zoomSpeed);
    });

    _defineProperty(_assertThisInitialized(_this), "reset", function () {
      _this.setState({
        x: 0,
        y: 0,
        scale: 1,
        angle: 0
      });
    });

    _defineProperty(_assertThisInitialized(_this), "getContainerBoundingRect", function () {
      return _this.getContainer().getBoundingClientRect();
    });

    _defineProperty(_assertThisInitialized(_this), "getOffset", function (e) {
      var containerRect = _this.getContainerBoundingRect();

      var offsetX = e.clientX - containerRect.left;
      var offsetY = e.clientY - containerRect.top;
      return {
        x: offsetX,
        y: offsetY
      };
    });

    _defineProperty(_assertThisInitialized(_this), "getTransformMatrix", function (x, y, scale, angle) {
      if (!_this.dragContainer.current) {
        return {
          a: scale,
          b: 0,
          c: 0,
          d: scale,
          x: x,
          y: y
        };
      }

      var _this$getDragContaine = _this.getDragContainer(),
          clientWidth = _this$getDragContaine.clientWidth,
          clientHeight = _this$getDragContaine.clientHeight;

      var centerX = clientWidth / 2;
      var centerY = clientHeight / 2;
      return (0, _maths.TransformMatrix)({
        angle: angle,
        scale: scale,
        offsetX: x,
        offsetY: y
      }, {
        x: centerX,
        y: centerY
      });
    });

    _defineProperty(_assertThisInitialized(_this), "applyTransform", function () {
      _this.getDragContainer().style.transform = _this.transformMatrixString;
      _this.frameAnimation = 0;
    });

    _defineProperty(_assertThisInitialized(_this), "applyIntermediateTransform", function () {
      _this.getDragContainer().style.transform = _this.intermediateTransformMatrixString;
      _this.intermediateFrameAnimation = 0;
    });

    _defineProperty(_assertThisInitialized(_this), "getBoundCoordinates", function (coordinates, transformationParameters) {
      var x = coordinates.x,
          y = coordinates.y;
      var _this$props10 = _this.props,
          enableBoundingBox = _this$props10.enableBoundingBox,
          boundaryRatioVertical = _this$props10.boundaryRatioVertical,
          boundaryRatioHorizontal = _this$props10.boundaryRatioHorizontal;
      var _transformationParame = transformationParameters.offsetX,
          offsetX = _transformationParame === void 0 ? 0 : _transformationParame,
          _transformationParame2 = transformationParameters.offsetY,
          offsetY = _transformationParame2 === void 0 ? 0 : _transformationParame2;

      if (!enableBoundingBox) {
        return {
          boundX: x,
          boundY: y,
          offsetX: x,
          offsetY: y
        };
      }

      var _this$getContainerBou = _this.getContainerBoundingRect(),
          containerHeight = _this$getContainerBou.height,
          containerWidth = _this$getContainerBou.width;

      var _this$getDragContaine2 = _this.getDragContainer(),
          clientTop = _this$getDragContaine2.clientTop,
          clientLeft = _this$getDragContaine2.clientLeft,
          clientWidth = _this$getDragContaine2.clientWidth,
          clientHeight = _this$getDragContaine2.clientHeight;

      var clientBoundingBox = {
        top: clientTop,
        left: clientLeft,
        width: clientWidth,
        height: clientHeight
      };
      return (0, _maths.boundCoordinates)(x, y, {
        vertical: boundaryRatioVertical,
        horizontal: boundaryRatioHorizontal
      }, (0, _maths.getTransformedBoundingBox)(transformationParameters, clientBoundingBox), containerHeight, containerWidth, offsetX, offsetY);
    });

    return _this;
  }

  _createClass(PanZoom, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this$props11 = this.props,
          autoCenter = _this$props11.autoCenter,
          autoCenterZoomLevel = _this$props11.autoCenterZoomLevel,
          minZoom = _this$props11.minZoom,
          maxZoom = _this$props11.maxZoom;

      if (this.container.current) {
        this.container.current.addEventListener('wheel', this.onWheel, {
          passive: false
        });
      }

      if (maxZoom < minZoom) {
        throw new Error('[PanZoom]: maxZoom props cannot be inferior to minZoom');
      }

      if (autoCenter) {
        this.autoCenter(autoCenterZoomLevel, false);
      }
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.autoCenter !== this.props.autoCenter && this.props.autoCenter) {
        this.autoCenter(this.props.autoCenterZoomLevel);
      }

      if ((prevState.x !== this.state.x || prevState.y !== this.state.y || prevState.scale !== this.state.scale || prevState.angle !== this.state.angle) && this.props.onStateChange) {
        this.props.onStateChange({
          x: this.state.x,
          y: this.state.y,
          scale: this.state.scale,
          angle: this.state.angle
        });
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.cleanMouseListeners();
      this.cleanTouchListeners();
      (0, _events.releaseTextSelection)();

      if (this.container.current) {
        this.container.current.removeEventListener('wheel', this.onWheel, {
          passive: false
        });
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props12 = this.props,
          children = _this$props12.children,
          autoCenter = _this$props12.autoCenter,
          autoCenterZoomLevel = _this$props12.autoCenterZoomLevel,
          zoomSpeed = _this$props12.zoomSpeed,
          doubleZoomSpeed = _this$props12.doubleZoomSpeed,
          disabled = _this$props12.disabled,
          disableDoubleClickZoom = _this$props12.disableDoubleClickZoom,
          disableScrollZoom = _this$props12.disableScrollZoom,
          disableKeyInteraction = _this$props12.disableKeyInteraction,
          realPinch = _this$props12.realPinch,
          keyMapping = _this$props12.keyMapping,
          minZoom = _this$props12.minZoom,
          maxZoom = _this$props12.maxZoom,
          enableBoundingBox = _this$props12.enableBoundingBox,
          boundaryRatioVertical = _this$props12.boundaryRatioVertical,
          boundaryRatioHorizontal = _this$props12.boundaryRatioHorizontal,
          noStateUpdate = _this$props12.noStateUpdate,
          onPanStart = _this$props12.onPanStart,
          onPan = _this$props12.onPan,
          onPanEnd = _this$props12.onPanEnd,
          preventPan = _this$props12.preventPan,
          style = _this$props12.style,
          onDoubleClick = _this$props12.onDoubleClick,
          onMouseDown = _this$props12.onMouseDown,
          onKeyDown = _this$props12.onKeyDown,
          onKeyUp = _this$props12.onKeyUp,
          onTouchStart = _this$props12.onTouchStart,
          onStateChange = _this$props12.onStateChange,
          restPassThroughProps = _objectWithoutProperties(_this$props12, ["children", "autoCenter", "autoCenterZoomLevel", "zoomSpeed", "doubleZoomSpeed", "disabled", "disableDoubleClickZoom", "disableScrollZoom", "disableKeyInteraction", "realPinch", "keyMapping", "minZoom", "maxZoom", "enableBoundingBox", "boundaryRatioVertical", "boundaryRatioHorizontal", "noStateUpdate", "onPanStart", "onPan", "onPanEnd", "preventPan", "style", "onDoubleClick", "onMouseDown", "onKeyDown", "onKeyUp", "onTouchStart", "onStateChange"]);

      var _this$state3 = this.state,
          x = _this$state3.x,
          y = _this$state3.y,
          scale = _this$state3.scale,
          angle = _this$state3.angle;
      var transform = getTransformMatrixString(this.getTransformMatrix(x, y, scale, angle));

      if (process.env.NODE_ENV !== 'production') {
        (0, _warning["default"])(onDoubleClick === undefined || typeof onDoubleClick === 'function', "Expected `onDoubleClick` listener to be a function, instead got a value of `%s` type.", _typeof(onDoubleClick));
        (0, _warning["default"])(onMouseDown === undefined || typeof onMouseDown === 'function', "Expected `onMouseDown` listener to be a function, instead got a value of `%s` type.", _typeof(onMouseDown));
        (0, _warning["default"])(onKeyDown === undefined || typeof onKeyDown === 'function', "Expected `onKeyDown` listener to be a function, instead got a value of `%s` type.", _typeof(onKeyDown));
        (0, _warning["default"])(onKeyUp === undefined || typeof onKeyUp === 'function', "Expected `onKeyUp` listener to be a function, instead got a value of `%s` type.", _typeof(onKeyUp));
        (0, _warning["default"])(onTouchStart === undefined || typeof onTouchStart === 'function', "Expected `onTouchStart` listener to be a function, instead got a value of `%s` type.", _typeof(onTouchStart));
      }

      return /*#__PURE__*/React.createElement("div", _extends({
        ref: this.container
      }, disableKeyInteraction ? {} : {
        tabIndex: 0 // enable onKeyDown event

      }, {
        onDoubleClick: this.onDoubleClick,
        onMouseDown: this.onMouseDown // React onWheel event listener is broken on Chrome 73
        // The default options for the wheel event listener has been defaulted to passive
        // but this behaviour breaks the zoom feature of PanZoom.
        // Until further research onWheel listener is replaced by
        // this.container.addEventListener('mousewheel', this.onWheel, { passive: false })
        // see Chrome motivations https://developers.google.com/web/updates/2019/02/scrolling-intervention
        //onWheel={this.onWheel}
        ,
        onKeyDown: this.onKeyDown,
        onKeyUp: this.onKeyUp,
        onTouchStart: this.onTouchStart,
        style: _objectSpread({
          cursor: disabled ? 'initial' : 'pointer'
        }, style)
      }, restPassThroughProps), /*#__PURE__*/React.createElement("div", {
        ref: this.dragContainer,
        style: {
          display: 'inline-block',
          transformOrigin: '0 0 0',
          transform: transform,
          transition: 'all 0.10s linear',
          willChange: 'transform'
        }
      }, children));
    }
  }]);

  return PanZoom;
}(React.Component);

_defineProperty(PanZoom, "defaultProps", {
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
  preventPan: function preventPan() {
    return false;
  }
});

var _default = PanZoom;
exports["default"] = _default;