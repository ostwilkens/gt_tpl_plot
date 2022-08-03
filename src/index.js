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
    m(0.0, 0.0)
    l(0.25, 0.25 + RND.float(0.2))
    t(0.0, 0.1)
    t(-0.1, 0.0)

    return { penColor: 'black', penSize: 0.5, margin: 0.05, resize: true }
}

init(formula)
