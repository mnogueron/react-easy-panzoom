# react-easy-panzoom
[![Code](https://img.shields.io/badge/sources-GitHub-c9510c.svg?style=plastic)](https://github.com/mnogueron/react-easy-panzoom)
[![Code](https://img.shields.io/github/issues/mnogueron/react-easy-panzoom.svg?style=plastic)](https://github.com/mnogueron/react-easy-panzoom)
[![npm](https://img.shields.io/npm/v/react-easy-panzoom.svg?style=plastic)](https://www.npmjs.com/package/react-easy-panzoom)
[![Code](https://img.shields.io/npm/dt/react-easy-panzoom.svg?style=plastic)](https://www.npmjs.com/package/react-easy-panzoom)

![react-easy-panzoom-demo](https://user-images.githubusercontent.com/8511318/55997819-2ff98700-5cbc-11e9-99f5-67ea295f4f92.gif)

React components that enables pan and zoom features for any component. Try out the live demo __[here](https://codesandbox.io/s/ll1xrz9mx9)__

## Installation
react-panzoom requires React 16 or later.

Using `npm`:
```shell
npm install --save react-easy-panzoom
```

Using `yarn`:
```shell
yarn add react-easy-panzoom
```

## Usage

```js
import { PanZoom } from 'react-easy-panzoom'

// ...
render() {
  return (
    <PanZoom>
      { 'This content can be panned and zoomed' }
    </PanZoom>
  )
}
```

### Key mapping
`PanZoom` component natively supports keyboard interactions with arrow keys and `-` / `+` keys. This mapping can be extends using the `keyMapping` prop.

e.g. Mapping `w`, `a`, `s`, `d`:
```js
import { PanZoom } from 'react-easy-panzoom'

// ...
render() {
  return (
    <PanZoom
      keyMapping={{
        '87': { x: 0, y: -1, z: 0 },
        '83': { x: 0, y: 1, z: 0 },
        '65': { x: -1, y: 0, z: 0 },
        '68': { x: 1, y: 0, z: 0 },
      }}
    >
      { 'This content can be panned and zoomed' }
    </PanZoom>
  )
}
```

### Prevent pan
Sometimes it can be useful to prevent the view from panning, for example if the pan start is done on a clickable element.
`PanZoom` provides the `preventPan` prop that let you define a function to prevent panning.

e.g. prevent panning when starting the pan on a specific `div`
```js
content = null

// preventPan gives access to the event, as well as the 
// mouse coordinates in the coordinate system of the PanZoom container
preventPan = (event, x, y) => {
  // if the target is the content container then prevent panning
  if (e.target === content) {
    return true
  }

  // in the case the target is not the content container
  // use the coordinates to determine if the click happened
  // on the content container    
  const contentRect = content.getBoundingClientRect()

  const x1 = contentRect.left
  const x2 = contentRect.right
  const y1 = contentRect.top
  const y2 = contentRect.bottom

  return (x >= x1 && x <= x2) && (y >= y1 && y <= y2)
}

render() {
  return (
    <PanZoom
      preventPan={this.preventPan}
    >
      <div>{ 'This content can be panned and zoomed' }</div>
      <div ref={ref => this.content = ref}>{ 'This content can be panned and zoomed only outside of its container' }</div>
    </PanZoom>
  )
}
```

## Properties
|Name|Type|Default|Description|
|---|---|---|---|
|autoCenter|`bool`|false|Auto-center the view when mounting|
|autoCenterZoomLevel|`number`| |Specify the initial zoom level for auto-center|
|zoomSpeed|`number`|1|Sets the zoom speed|
|doubleZoomSpeed|`number`|1.75|Sets the zoom speed for double click|
|disabled|`bool`|false|Disable pan and zoom|
|disableKeyInteraction|`bool`|false|Disable keyboard interaction|
|realPinch|`bool`|false|Enable real pinch interaction for touch events|
|keyMapping|`object`|false|Define specific key mapping for keyboard interaction (e.g. `{ '<keyCode>': { x: 0, y: 1, z: 0 } }`, with `<keyCode>` being the key code to map)|
|minZoom|`number`| |Sets the minimum zoom value|
|maxZoom|`number`| |Sets the maximum zoom value|
|noStateUpdate|`bool`|true|Disable state update for each new x, y, z transform value while panning. Enabling it drastically increases the performances |
|onPanStart|`func`| |Fired on pan start|
|onPan|`func`| |Fired on pan|
|onPanEnd|`func`| |Fired on pan end|
|preventPan|`func`| |Defines a function to prevent pan|
|style|`object`| |Override the inline-styles of the root element|

## Methods
By using `ref`, methods from `PanZoom` can be accessed and called to trigger manipulation functions.

Available methods are listed below:

|Name|Parameters|Description|
|---|---|---|
|zoomIn| |Zoom in from the center of the `PanZoom` container|
|zoomOut| |Zoom out from the center of the `PanZoom` container|
|autoCenter| |Center and resize the view to fit the `PanZoom` container|
|reset| |Reset the view to it's original state (will not auto center if `autoCenter` is enabled)|
|moveByRatio|`(x: number, y: number, moveSpeedRatio?: number)`|Move the view along `x` or/and `y` axis|

## Thanks
This react library is based on the awesome [panzoom][panzoom] by @anvaka. 

## License

The files included in this repository are licensed under the MIT license.

[panzoom]: https://github.com/anvaka/panzoom
