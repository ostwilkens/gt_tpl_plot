import {
    RND,
    probability,
    pick,
    pickKey,
    weightedKey,
    seedFromHash
} from '@thi.ng/random-fxhash'
import { init } from './tools'

// function shortcuts
const log = console.log
const min = Math.min
const max = Math.max
const floor = Math.floor
const ceil = Math.ceil


// function that generates actions
const formula42 = (m, l, t) => {
    m(0.0, 0.0)
    l(0.25, 0.25)
    t(0.0, 0.1)
    t(-0.1, 0.0)

    return { penColor: 'black', penSize: 1.0 }
}

init(formula42)