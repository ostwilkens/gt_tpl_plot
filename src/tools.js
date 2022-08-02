import { adaptDPI } from '@thi.ng/adapt-dpi'
import {
    PathBuilder,
    asSvg
} from "@thi.ng/geom";

const download = (filename, text) => {
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}

const formulaToSvg = (actions) => {
    const pathBuilder = new PathBuilder(null, { autoSplit: false })

    for (const action of actions) {
        switch (action.type) {
            case 'm': {
                const { x, y } = action
                pathBuilder.moveTo([x, y])
                break
            }
            case 'l': {
                const { x, y } = action
                pathBuilder.lineTo([x, y])
                break
            }
        }
    }

    const path = pathBuilder.current()
    const svg = asSvg(path)
    return svg
}

export const init = (formulaFn) => {

    const actions = []
    var maxX = 0.0
    var minX = 1.0
    var maxY = 0.0
    var minY = 0.0
    var currentX = 0.0
    var currentY = 0.0

    const moveAction = (x, y) => {
        actions.push({
            type: 'm',
            x: x,
            y: y
        })

        currentX = x
        currentY = y

        maxX = Math.max(maxX, x)
        minX = Math.min(minX, x)
        maxY = Math.max(maxY, y)
        minY = Math.min(minY, y)
    }
    const lineAction = (x, y) => {
        actions.push({
            type: 'l',
            x: x,
            y: y
        })

        currentX = x
        currentY = y

        maxX = Math.max(maxX, x)
        minX = Math.min(minX, x)
        maxY = Math.max(maxY, y)
        minY = Math.min(minY, y)
    }
    const turtleAction = (x, y) => {
        x += currentX
        y += currentY

        lineAction(x, y)
    }
    const { penColor, penSize } = formulaFn(moveAction, lineAction, turtleAction)


    // rescale & center
    const drawingWidth = maxX - minX
    const drawingHeight = maxY - minY
    const paperWidth = 1.0
    const paperHeight = 1.0
    const margin = 0.1

    const scaleX = (paperWidth / 1.0 - margin * 2.0) / drawingWidth
    const scaleY = (paperHeight / 1.0 - margin * 2.0) / drawingHeight
    const scale = Math.min(scaleX, scaleY)

    const scaledDrawingWidth = drawingWidth * scale
    const scaledDrawingHeight = drawingHeight * scale

    const offsetX = (paperWidth - scaledDrawingWidth) / 2.0
    const offsetY = (paperHeight - scaledDrawingHeight) / 2.0

    for (var i = 0; i < actions.length; i++) {
        actions[i].x = (actions[i].x - minX) * scale + offsetX - 0.5
        actions[i].y = (actions[i].y - minY) * scale + offsetY - 0.5
    }


    const canvas = document.getElementById("canvas")
    canvas.addEventListener('dblclick', () => {
        const svgString = formulaToSvg(actions)
        console.log(svgString)
        download(`${fxhash}.svg`, svgString)
    })
    const ctx = canvas.getContext('2d')

    const render = () => {
        ctx.strokeStyle = penColor
        ctx.lineWidth = canvas.width * 0.005 * penSize
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'

        const scaleToCanvas = ([x, y]) => [(x + 0.5) * canvas.width, (y + 0.5) * canvas.height]

        for (const action of actions) {
            switch (action.type) {
                case 'm': {
                    const [x, y] = scaleToCanvas([action.x, action.y])
                    ctx.moveTo(x, y)
                    break
                }
                case 'l': {
                    const [x, y] = scaleToCanvas([action.x, action.y])
                    ctx.lineTo(x, y)
                    break
                }
            }
        }

        ctx.stroke()
    }

    new ResizeObserver(entries => {
        const entry = entries[0]
        const { width, height } = entry.contentRect
        adaptDPI(canvas, width, height)
        render()
    }).observe(canvas)

    adaptDPI(canvas, canvas.clientWidth, canvas.clientHeight)
    render()
    if (isFxpreview) {
        fxpreview()
    }
}