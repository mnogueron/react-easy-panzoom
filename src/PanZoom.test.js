import React from 'react'
import { mount } from 'enzyme'

const PanZoom = require('./PanZoom').default

const PANZOOM_WIDTH = 500
const PANZOOM_HEIGHT = 500

const style = { width: PANZOOM_WIDTH, height: PANZOOM_HEIGHT }

const raf = async () => {
  await new Promise((resolve) =>
    requestAnimationFrame(() => {
      resolve()
    })
  )
}

const mockGetContainerBoundingRect = (width = PANZOOM_WIDTH, height = PANZOOM_HEIGHT) => jest.fn(() => ({
  width,
  height,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
}))

const children = <div>{'panzoom content'}</div>

describe('Smoke tests', () => {
  test('should render without crashing', () => {
    mount(<PanZoom />)
  })

  test('should render child', () => {
    const wrapper = mount(<PanZoom>{children}</PanZoom>)
    expect(wrapper.contains(children)).toBe(true)
  })
})

describe('Interactions and transformations', () => {
  test('should pan with mouse interactions', async () => {
    const wrapper = mount(<PanZoom style={style}>{children}</PanZoom>)

    // we need to mock getContainerBoundingRect as jest doesn't support
    // full browser rendering and getBoundingClientRect default to 0's
    wrapper.instance().getContainerBoundingRect = mockGetContainerBoundingRect()
    wrapper.simulate('mousedown', { button: 0, clientX: 5, clientY: 5 })
    expect(wrapper.instance().mousePos).toStrictEqual({ x: 5, y: 5 })

    // move by 2 on x and y axis
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 7, clientY: 7 }))

    // trigger requestAnimationFrame
    await raf()
    expect(wrapper.instance().mousePos).toStrictEqual({ x: 7, y: 7 })
    expect(wrapper.instance().prevPanPosition).toStrictEqual({ x: 2, y: 2 })
    expect(wrapper.instance().getDragContainer().style.transform).toBe('matrix(1, 0, 0, 1, 2, 2)')

    // move by 4 on x and 6 on y axis
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 11, clientY: 13 }))

    // trigger requestAnimationFrame
    await raf()
    expect(wrapper.instance().mousePos).toStrictEqual({ x: 11, y: 13 })
    expect(wrapper.instance().prevPanPosition).toStrictEqual({ x: 6, y: 8 })
    expect(wrapper.instance().getDragContainer().style.transform).toBe('matrix(1, 0, 0, 1, 6, 8)')

    document.dispatchEvent(new MouseEvent('mouseup'))
    expect(wrapper.state()).toStrictEqual({ x: 6, y: 8, angle: 0, scale: 1 })
  })

  test('should pan with touch interactions', async () => {
    const wrapper = mount(<PanZoom style={style}>{children}</PanZoom>)

    // we need to mock getContainerBoundingRect as jest doesn't support
    // full browser rendering and getBoundingClientRect default to 0's
    wrapper.instance().getContainerBoundingRect = mockGetContainerBoundingRect()
    wrapper.simulate('touchstart', { touches: [{ clientX: 5, clientY: 5 }] })
    expect(wrapper.instance().mousePos).toStrictEqual({ x: 5, y: 5 })

    // move by 2 on x and y axis
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 7, clientY: 7 }] }))

    // trigger requestAnimationFrame
    await raf()
    expect(wrapper.instance().mousePos).toStrictEqual({ x: 7, y: 7 })
    expect(wrapper.instance().prevPanPosition).toStrictEqual({ x: 2, y: 2 })
    expect(wrapper.instance().getDragContainer().style.transform).toBe('matrix(1, 0, 0, 1, 2, 2)')

    // move by 4 on x and 6 on y axis
    document.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 11, clientY: 13 }] }))

    // trigger requestAnimationFrame
    await raf()
    expect(wrapper.instance().mousePos).toStrictEqual({ x: 11, y: 13 })
    expect(wrapper.instance().prevPanPosition).toStrictEqual({ x: 6, y: 8 })
    expect(wrapper.instance().getDragContainer().style.transform).toBe('matrix(1, 0, 0, 1, 6, 8)')

    document.dispatchEvent(new TouchEvent('touchend', { touches: [] }))
    expect(wrapper.state()).toStrictEqual({ x: 6, y: 8, angle: 0, scale: 1 })
  })

  test.todo('should capture and release text selection')

  /*test('should capture and release text selection', async () => {
    const wrapper = mount(<PanZoom style={style}>{children}</PanZoom>)

    // we need to mock getContainerBoundingRect as jest doesn't support
    // full browser rendering and getBoundingClientRect default to 0's
    wrapper.instance().getContainerBoundingRect = mockGetContainerBoundingRect()
    wrapper.simulate('mousedown', { button: 0, clientX: 5, clientY: 5 })

    //const spy = jest.spyOn(events, 'preventDefault')
    window.dispatchEvent(new Event('selectstart'))
    expect(spy).toHaveBeenCalledTimes(1)
  })*/
})
