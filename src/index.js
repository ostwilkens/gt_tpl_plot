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
const PI = Math.PI
const PI2 = Math.PI * 2.0
// noise([pos], freq, ampl, oct, lacu, gain)

const features = window.$fxhashFeatures = {
    // "Dark": probability(0.2),
    // "Dark": false,
    "Pen Size": pick([0.5, 0.6, 0.7]),
    // "Pen Color": pick(["red", "black"]),
}

const formula = (m, l, t) => {
    for (var i = 0.0; i < PI2; i += 0.1) {
        var x = cos(i)
        var y = sin(i)
        var r = noise([x, y], 1, 10, 3)
        m(x * r, y * r)
        l(x, y)
    }

    return { invert: false, penColor: features["Pen Color"], penSize: features["Pen Size"], margin: 0.05, resize: true }
}

init(formula)
