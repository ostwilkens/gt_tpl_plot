import {
    RND,
    probability,
    pick,
    pickKey,
    weightedKey,
    seedFromHash
} from '@thi.ng/random-fxhash'
import {
    defNoise,
    defPattern,
    drawLine,
    drawPolyLine,
    drawRect,
    traceLine,
} from '@thi.ng/rasterize'
import {
    floatBuffer,
    floatBufferFromCanvas,
    floatBufferFromImage,
    intBuffer,
} from '@thi.ng/pixel'
import { adaptDPI } from '@thi.ng/adapt-dpi'
import {
    compFill,
    defDots,
    defHatchPen,
    fuzzyPoly,
    jitterPoints,
} from "@thi.ng/geom-fuzz";
import {
    PathBuilder,
    asSvg,
    Polyline
} from "@thi.ng/geom";
import { vertices } from "@thi.ng/geom/vertices";
import { draw } from "@thi.ng/hiccup-canvas/draw";
import { group } from "@thi.ng/geom/group";

// const { devicePixelRatio } = window
// const renderWidth = 1024 * devicePixelRatio
// const renderHeight = renderWidth



const init = () => {
    const container = document.createElement('div')
    container.setAttribute('id', 'container')

    const canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'canvas')
    // canvas.setAttribute('width', renderWidth)
    // canvas.setAttribute('height', renderHeight)
    container.appendChild(canvas)

    document.body.appendChild(container)

    const ctx = canvas.getContext('2d')

    const calls = []

    // function to move without drawing

    // function to move and draw
    // adds action to array for later execution
    const moveTo = (x, y) => {
        calls.push({
            type: 'moveTo',
            x: x,
            y: y,
        })
    }

    const lineTo = (x, y) => {
        calls.push({
            type: 'lineTo',
            x: x,
            y: y,
        })
    }

    moveTo(0, 0)
    lineTo(0.5, 0)


    // generate geom path from `calls`
    const pathBuilder = new PathBuilder(null, { autoSplit: false })

    pathBuilder.moveTo([0.0, 0.0])
    pathBuilder.lineTo([0.5, 0.5])
    pathBuilder.lineTo([0.0, 0.5])

    // pathBuilder.moveTo([30.0, 10.0])
    // pathBuilder.lineTo([30.0, 200.0])

    const path = pathBuilder.current()

    const svg = asSvg(path)
    console.log(svg)

    // const polylines = []
    // var currentLine = []

    // build small segments
    const segments = []

    var currentPoint = [0.0, 0.0]
    for (const segment of path.segments) {
        switch (segment.type) {
            case 'm': {
                currentPoint = segment.point
                segments.push(segment)
                break
            }
            case 'l': {
                const points = segment.geo.points
                const point = points[1]


                var segmentCompleted = false
                while (!segmentCompleted) {
                    const diff = [currentPoint[0] - point[0], currentPoint[1] - point[1]]
                    const distance = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1])
                    const normal = [-diff[0] / distance, -diff[1] / distance]
                    const stepSize = Math.min(0.1, distance)
                    const newPoint = [currentPoint[0] + normal[0] * stepSize, currentPoint[1] + normal[1] * stepSize]

                    segments.push({
                        type: 'l',
                        geo: {
                            points: [currentPoint, newPoint]
                        }
                    })

                    currentPoint = newPoint

                    if (distance < 0.2) {
                        segmentCompleted = true
                    }
                }


                break
            }
        }
    }

    // console.log(segments)
    // return

    // if (currentLine && currentLine.length > 0) {
    //     polylines.push(currentLine)
    //     currentLine = []
    // }

    const penTextureBuffer = floatBufferFromImage(penTextureImg)
    const penTextureShader = defPattern(penTextureBuffer)

    var penPos = [0.0, 0.0]

    const render = () => {

        ctx.strokeStyle = 'black'
        ctx.lineWidth = canvas.width * 0.005
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'

        var buffer = floatBufferFromCanvas(canvas)

        const renderSegment = (segment) => {
            switch (segment.type) {
                case 'm': {
                    const { point } = segment
                    const x = (point[0] + 0.5) * canvas.width
                    const y = (point[1] + 0.5) * canvas.height
                    ctx.moveTo(x, y)
                    penPos = [x, y]
                    break
                }
                case 'l': {
                    const points = segment.geo.points
                    const point = points[1]
                    const x = (point[0] + 0.5) * canvas.width
                    const y = (point[1] + 0.5) * canvas.height

                    // var segmentCompleted = false
                    // for (var i = 0; i < 100 && !segmentCompleted; i++) {
                    // const diff = [penPos[0] - x, penPos[1] - y]
                    // const diffLength = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1])
                    // // const speed = diffLength * 0.01 + 0.01
                    // const speed = 10.0

                    // const normalX = -diff[0] / diffLength
                    // const normalY = -diff[1] / diffLength

                    // const newX = penPos[0] + normalX * speed
                    // const newY = penPos[1] + normalY * speed

                    // console.log(newX, newY)

                    ctx.lineTo(x, y)
                    ctx.stroke()
                    penPos = [x, y]

                    buffer = floatBufferFromCanvas(canvas)
                    buffer.blitCanvas(canvas)

                    // ctx.lineTo(x, y)
                    break
                }
            }
        }

        const drawCalls = []
        for (const segment of segments) {
            const drawCall = () => renderSegment(segment)
            drawCalls.push(drawCall)
        }

        const popDraw = () => {
            const call = drawCalls.pop()

            if (call) {
                setTimeout(() => {
                    call()
                    popDraw()
                }, 10)
            } else {
                fxpreview()
            }
        }
        popDraw()

        // ctx.stroke()


        // const buffer = floatBufferFromCanvas(canvas)
        // const myshader = (buffer) => (x, y) => {
        //     const pixel = buffer.getAt(x, y)

        //     const penTexture = penTextureShader(x, y)
        //     const noiseWeight = 0.4
        //     pixel[0] += penTexture[0] * noiseWeight
        //     pixel[1] += penTexture[1] * noiseWeight
        //     pixel[2] += penTexture[2] * noiseWeight

        //     return pixel
        // }

        // drawRect(buffer, 0.0, 0.0, buffer.width, buffer.height, myshader(buffer), true)

        // buffer.blitCanvas(canvas)
    }

    // const render = () => {
    //     for (const polyline of polylines) {
    //         // const PEN1 = defHatchPen([0, 0.0, 1, 0.5]);
    //         const verts = polyline

    //         // console.log(verts)

    //         const scaledVerts = verts.map(([x, y]) => [(x + 0.5) * canvas.width, (y + 0.5) * canvas.height])

    //         // const polynew Polyline(scaledVerts)

    //         // const poly = fuzzyPoly(scaledVerts, {}, { fill: PEN1 })


    //         const buffer = floatBuffer(canvas.width, canvas.height)

    //         // const polyline2 = new Polyline(scaledVerts, { stroke: "black", scale: window.devicePixelRatio || 1 })
    //         const polyline2 = new Polyline(scaledVerts)

    //         // const defUVGradient = (width, height) => (x, y) => [x/width, y/height, 0.5, 1]
    //         // console.log())
    //         // drawLine(buffer, 0, 0, 20, 20, [0.0, 0.0, 0.0, 1.0])
    //         // drawPolyLine(buffer, scaledVerts, defUVGradient)

    //         // const 


    //         // draw(ctx, group({ stroke: "black", scale: window.devicePixelRatio || 1, weight: window.devicePixelRatio || 1 }, [new Polyline(scaledVerts)]))

    //         //     // // const displayWidth = canvas.clientWidth
    //         //     // // const displayHeight = canvas.clientHeight

    //         //     // // const displayImg = img.resize(displayWidth, displayHeight, "linear")
    //         //     // // displayImg.blitCanvas(canvas)

    //         buffer.blitCanvas(canvas)

    //         // Polyline

    //     }
    // }

    render()



    // // start drawing: 
    // // incrementally draw on fixed-size high-res offscreen float canvas
    // // copy to visible integer canvas

    // const render = () => {
    //     ctx.strokeStyle = 'black'
    //     ctx.lineWidth = renderWidth * 0.002
    //     ctx.lineJoin = 'round'
    //     ctx.lineCap = 'round'

    //     for(const { type, x, y } of calls) {

    //         const rx = (x + 0.5) * canvas.width
    //         const ry = (y + 0.5) * canvas.height

    //         switch(type) {
    //             case 'lineTo':
    //                 ctx.lineTo(rx, ry)
    //                 break
    //             case 'moveTo':
    //                 ctx.moveTo(rx, ry)
    //                 break
    //         }
    //     }
    //     ctx.stroke()
    // }
    // render()


    // const render = () => {

    //     // const { devicePixelRatio } = window

    //     const buffer = floatBuffer(renderWidth, renderHeight)
    //     drawLine(buffer, 0, 0, 20, 20, [0.0, 0.0, 0.0, 1.0])

    //     // // const displayWidth = canvas.clientWidth
    //     // // const displayHeight = canvas.clientHeight

    //     // // const displayImg = img.resize(displayWidth, displayHeight, "linear")
    //     // // displayImg.blitCanvas(canvas)

    //     buffer.blitCanvas(canvas)
    // }


    const observer = new ResizeObserver(entries => {
        const entry = entries[0]
        const { width, height } = entry.contentRect

        adaptDPI(canvas, width, height)

        render()

        // buffer.blitCanvas(canvas)
        // console.log(width, height)

        // canvas.width = width
        // canvas.height = height

        // const displayImg = buffer.resize(width, height, "linear")
        // displayImg.blitCanvas(canvas)

        // buffer.blitCanvas(canvas)
    })
    observer.observe(canvas)
}


const penTextureImg = new Image()
penTextureImg.onload = init
penTextureImg.src = "./pen_noise.png"