import { createReadStream, createWriteStream, writeFileSync } from 'fs'
import portAudio from 'naudiodon'
import { Reader } from 'wav'

let mic = portAudio.AudioIO({
    inOptions: {
        sampleFormat: portAudio.SampleFormat32Bit,
        channelCount: 1,
        closeOnError: false
    }
})

let out = portAudio.AudioIO({
    outOptions: {
        sampleFormat: portAudio.SampleFormat16Bit,
        channelCount: 2,
        closeOnError: false
    }
})

// let a = Buffer.from([15, 250, 3])
// let b = Buffer.from([70, 120, 13])
// let c = a
// console.log(a)

let reader = new Reader()
let gawr: Buffer = Buffer.from([])
let gura = createReadStream('a.wav')
reader.on('format', () => {
    reader.on('data', c => {
        gawr = Buffer.concat([gawr, c])
    })
})
gura.pipe(reader)

mic.on('data', (chunk: Buffer) => {
    for (let i = 0; i < chunk.length; i += 4) {
        // convert mono to stereo
        chunk.writeInt16LE(chunk.readInt16LE(i + 2), i)
    }

    if (gawr.length >= chunk.length) {
        for (let i = 0; i < chunk.length; i += 2) {
            let n = chunk.readInt16LE(i)
            n += gawr.readInt16LE(i) / 2
            if (n >= 32767) n = 32767
            if (n < -32768) n = -32768
            chunk.writeInt16LE(n, i)
        }
        gawr = gawr.slice(chunk.length)
    }

    out.write(chunk)
})

out.start()
mic.start()