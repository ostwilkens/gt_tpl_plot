import {
    PathBuilder,
    asSvg,
    svgDoc,
} from "@thi.ng/geom";
import { Noise } from './noise'

export const noise = new Noise(fxhash).noise

const download = (filename, text) => {
    var element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
}

const formulaToSvg = (actions, settings) => {
    const { penColor, penSize, margin } = settings

    const scale = 800
    const strokeWidth = scale * 0.005 * penSize

    const pathBuilder = new PathBuilder(null, { autoSplit: false })
    for (const action of actions) {
        switch (action.type) {
            case 'm': {
                const { x, y } = action
                pathBuilder.moveTo([(x + 0.5) * scale, (y + 0.5) * scale])
                break
            }
            case 'l': {
                const { x, y } = action
                pathBuilder.lineTo([(x + 0.5) * scale, (y + 0.5) * scale])
                break
            }
        }
    }

    const path = pathBuilder.current()

    const svg = asSvg(
        svgDoc(
            {
                width: scale,
                height: scale,
                viewBox: `0 0 ${scale} ${scale}`,
                fill: "none",
                stroke: penColor,
                "stroke-width": strokeWidth,
            },
            path
        )
    )

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
    const settings = formulaFn(moveAction, lineAction, turtleAction)
    const { penColor, penSize, margin, resize } = settings

    // rescale & center
    if (resize) {
        const drawingWidth = maxX - minX
        const drawingHeight = maxY - minY
        const paperWidth = 1.0
        const paperHeight = 1.0

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
    } else {
        for (var i = 0; i < actions.length; i++) {
            actions[i].x -= 0.5
            actions[i].y -= 0.5
        }
    }

    const canvas = document.getElementById("canvas")
    canvas.addEventListener('dblclick', () => {
        const svgString = formulaToSvg(actions, settings)
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

        canvas.width = width * (window.devicePixelRatio || 1)
        canvas.height = height * (window.devicePixelRatio || 1)

        render()
    }).observe(canvas)

    canvas.width = canvas.clientWidth * (window.devicePixelRatio || 1)
    canvas.height = canvas.clientHeight * (window.devicePixelRatio || 1)
    render()

    if (isFxpreview) {
        fxpreview()
    }
}