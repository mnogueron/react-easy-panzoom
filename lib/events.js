"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.releaseTextSelection = exports.captureTextSelection = exports.preventDefault = void 0;

var preventDefault = function preventDefault(e) {
  e.preventDefault();
};

exports.preventDefault = preventDefault;

var captureTextSelection = function captureTextSelection() {
  window.addEventListener('selectstart', preventDefault);
};

exports.captureTextSelection = captureTextSelection;

var releaseTextSelection = function releaseTextSelection() {
  window.removeEventListener('selectstart', preventDefault);
};

exports.releaseTextSelection = releaseTextSelection;