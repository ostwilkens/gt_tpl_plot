/*
MIT License
Copyright (c) 2020 brubsby
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import SimplexNoise from './simplex.js'
// require("./simplexnoise.js")
// import './simplexnoise.js'

export function Noise(seed) {
    this.simplex = new SimplexNoise(seed)
    this.newFunctionStartLine = (() => {
        try { (new Function('undefined_function()'))() }
        catch (e) {
            if (e.lineNumber || e.line) {
                return e.lineNumber
            } else {
                const match = e.stack.match(/(<anonymous>|Function):(\d+):\d+/)
                if (match) {
                    return parseInt(match[2])
                }
            }
            return 1
        }
    })()
    this.newFunctionLineOffset = this.newFunctionStartLine - 1

    this.noise = (coords, frequency = 1, amplitude = 1, octaves = 1, lacunarity = 2, gain = 0.5) => {
        var octave_amplitude = amplitude
        var octave_frequency = frequency
        var result = 0
        for (var i = 0; i < octaves; i++) {
            if (Array.isArray(coords)) {
                switch (coords.length) {
                    case 1:
                        result += octave_amplitude * this.simplex.noise2D(octave_frequency * coords[0], 0)
                        break
                    case 2:
                        result += octave_amplitude * this.simplex.noise2D(octave_frequency * coords[0], octave_frequency * coords[1])
                        break
                    case 3:
                        result += octave_amplitude * this.simplex.noise3D(octave_frequency * coords[0], octave_frequency * coords[1], octave_frequency * coords[2])
                        break
                    case 4:
                        result += octave_amplitude * this.simplex.noise4D(octave_frequency * coords[0], octave_frequency * coords[1], octave_frequency * coords[2], octave_frequency * coords[3])
                        break
                }
            } else {
                result += octave_amplitude * this.simplex.noise2D(octave_frequency * coords, 0)
            }
            octave_amplitude *= gain
            octave_frequency *= lacunarity
        }
        return result
    }
}
