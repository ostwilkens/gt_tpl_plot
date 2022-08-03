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


const formula = (m, l, t) => {
    for (var i = 0.0; i < PI2; i += 0.1) {
        var x = cos(i)
        var y = sin(i)
        var r = noise([x, y], 1, 10, 3)
        m(x * r, y * r)
        l(x, y)
    }

    return { penColor: 'black', penSize: 0.3 + RND.float(0.4), margin: 0.05, resize: true }
}

init(formula)
