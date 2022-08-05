import {
    RND,
    probability,
    pick,
    pickKey,
    weightedKey,
    seedFromHash
} from '@thi.ng/random-fxhash'
import { init, noise } from './tools'

// function shortcuts
const log = console.log
const min = Math.min
const max = Math.max
const sin = Math.sin
const cos = Math.cos
const floor = Math.floor
const ceil = Math.ceil
const abs = Math.abs
const sqrt = Math.sqrt
const PI = Math.PI
const PI2 = Math.PI * 2.0
// noise([pos], freq, ampl, oct, lacu, gain)

const features = window.$fxhashFeatures = {
    "Dark": probability(0.2),
    "Pen Size": pick([0.4, 0.6, 0.8])
}

const formula = (m, l, j, t) => {
    for (var i = 0.0; i <= PI2; i += PI2 / 1000.0) {
        var x = cos(i)
        var y = sin(i)
        var n = noise([x, y])
        x *= 1.0 + n
        y *= 1.0 + n
        l(x, y)
    }

    return {
        invert: features["Dark"],
        penColor: "black",
        penSize: features["Pen Size"],
        margin: 0.05,
        resize: true
    }
}

init(formula)
