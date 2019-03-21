# react-easy-panzoom
__🚧 Please be advised that this library is currently under construction and might change quickly  🚧__

Wrapper to enable pan and zoom features for any React component

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
|onPanStart|`func`| |Fired on pan start|
|onPan|`func`| |Fired on pan|
|onPanEnd|`func`| |Fired on pan end|
|style|`object`| |Override the inline-styles of the root element|

## Thanks
This react library is based on the awesome [panzoom][panzoom] by @anvaka. 

## License

The files included in this repository are licensed under the MIT license.

[panzoom]: https://github.com/anvaka/panzoom
