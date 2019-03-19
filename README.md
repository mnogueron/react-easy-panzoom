# react-panzoom
Wrapper to enable pan and zoom features for any React component

## Installation
react-panzoom requires React 16 or later.

Using `npm`:
```shell
npm install --save react-panzoom
```

Using `yarn`:
```shell
yarn add react-panzoom
```

## Usage

```js
import PanZoom from 'react-panzoom'

// ...
render() {
  return (
    <PanZoom>
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
|onPanStart|`func`| |Fired on pan start|
|onPan|`func`| |Fired on pan|
|onPanEnd|`func`| |Fired on pan end|
|style|`object`| |Override the inline-styles of the root element|

## License

The files included in this repository are licensed under the MIT license.
