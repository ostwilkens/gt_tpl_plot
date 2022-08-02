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

const formula44 = (m, l, t) => {

    for (var i = 1; i < 20; i++) {
        var x = 0
        var y = 0

        var points = 80

        for (var k = 0; k < points; k++) {
            var a = 2 * PI * k / points + i / 1
            var cx = cos(a + 0.52)
            var cy = sin(a + 0.4)
            var r = 90 + noise([cx, cy, i * 1], 10, 23, 3)
            cx *= r
            cy *= r
            var a1 = r * 0.41
            m(x + cos(a) * a1, y + sin(a) * a1)
            var xo = noise([cx, cy, i], 0.01, 20, 3) * 0
            var yo = noise([cy, cx, i], 0.01, 20, 3) * 0
            l(x + cx + xo, (y + cy * 1.25 + yo) * 1.0)
        }
    }


    return { penColor: 'black', penSize: 0.3, margin: 0.05 }
}

const formula43 = (m, l, t) => {
    var dir = 1
    var start_x = -0.25
    var start_y = -1
    var jump_size = 0.3
    var tick_size = 0.003
    var line_length = 2
    var tick_count = line_length / tick_size
    var line_count = 199

    m(start_x, start_y)

    const jump_fn = (line_progress) => {
        // var x = sin(line_progress * PI * 2.5) * 8
        // var y = jump_size * 8

        var x = sin(line_progress * PI * 2.5) * 0
        var y = jump_size * 12

        t(x, y)
    }

    const line_fn = (line_progress, tick_progress, dir) => {
        // var a1 = tick_progress * PI * 0.8
        // var a2 = 1.5
        // var mx = sin(a1) * dir * a2
        // var my = cos(a1) * dir * a2

        var a1 = tick_progress * PI * 1 * (0.8 - noise([tick_progress, line_progress], 5, 0.2, 3))
        var a2 = 1
        var mx = sin(a1) * dir * a2
        var my = cos(a1) * dir * a2

        t(mx, my)
    }

    // move along dir
    for (var line = 0; line < line_count; line++) {
        var line_progress = line / line_count

        for (var tick = 0; tick <= tick_count; tick++) {
            var tick_progress = dir > 0 ? tick / tick_count : 1 - tick / tick_count

            // the line function (can be reversed)
            line_fn(line_progress, tick_progress, dir)
        }

        var last_line = line === line_count - 1
        if (!last_line) {
            jump_fn(line_progress)
            dir = -dir
        }

    }

    return { penColor: 'black', penSize: 0.4 }
}

// function that generates actions
const formula42 = (m, l, t) => {
    m(0.0, 0.0)
    l(0.25, 0.25)
    t(0.0, 0.1)
    t(-0.1, 0.0)

    return { penColor: 'black', penSize: 1.0 }
}

init(formula44)