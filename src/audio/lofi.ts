// A tiny lofi jazz generator built on the Web Audio API.
// Everything is synthesized in the browser (Rhodes-style chords, upright-ish bass, brushed drums,
// vinyl crackle), so there are no audio files to host and no licensing to track.

const BPM = 72
const BEAT = 60 / BPM
const SWING = 0.62 // share of the beat taken by the first eighth note
const LOOKAHEAD = 0.15 // seconds of audio scheduled ahead
const TICK_MS = 25

// ii–V–I–vi style loop in C: Dm9, G13, Cmaj9, A7(b13) as MIDI note numbers.
const CHORDS: number[][] = [
  [50, 53, 57, 60, 64],
  [43, 53, 57, 59, 64],
  [48, 52, 55, 59, 62],
  [45, 49, 55, 59, 65],
]
const BASS = [38, 31, 36, 33]
const MELODY_SCALE = [69, 72, 74, 76, 79, 81]

const midiToHz = (note: number) => 440 * 2 ** ((note - 69) / 12)

export class LofiPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private noise: AudioBuffer | null = null
  private crackle: AudioBufferSourceNode | null = null
  private timer = 0
  private nextBeatTime = 0
  private beat = 0
  private levels = new Uint8Array(0)

  get playing() {
    return this.timer !== 0
  }

  async start() {
    if (this.playing) return
    const ctx = (this.ctx ??= new AudioContext())
    await ctx.resume()

    // master chain: gain → warm low-pass → gentle compression → speakers (+ analyser tap)
    const master = ctx.createGain()
    master.gain.value = 0
    const tone = ctx.createBiquadFilter()
    tone.type = 'lowpass'
    tone.frequency.value = 2400
    tone.Q.value = 0.4
    const glue = ctx.createDynamicsCompressor()
    glue.threshold.value = -18
    glue.ratio.value = 3
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    master.connect(tone).connect(glue)
    glue.connect(ctx.destination)
    glue.connect(analyser)
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5)

    this.master = master
    this.analyser = analyser
    this.levels = new Uint8Array(analyser.fftSize)
    this.noise ??= this.makeNoise(ctx)
    this.startCrackle(ctx, master)

    this.beat = 0
    this.nextBeatTime = ctx.currentTime + 0.1
    this.timer = window.setInterval(() => this.schedule(), TICK_MS)
  }

  stop() {
    if (!this.playing || !this.ctx || !this.master) return
    window.clearInterval(this.timer)
    this.timer = 0
    const { ctx, master } = this
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + 0.6)
    const crackle = this.crackle
    window.setTimeout(() => {
      crackle?.stop()
      master.disconnect()
    }, 700)
    this.crackle = null
    this.master = null
  }

  /** Loudness from 0 to ~1, for animating the speaker. */
  level() {
    if (!this.analyser) return 0
    this.analyser.getByteTimeDomainData(this.levels)
    let sum = 0
    for (const value of this.levels) {
      const v = (value - 128) / 128
      sum += v * v
    }
    return Math.min(1, Math.sqrt(sum / this.levels.length) * 4)
  }

  private schedule() {
    const ctx = this.ctx
    if (!ctx || !this.master) return
    while (this.nextBeatTime < ctx.currentTime + LOOKAHEAD) {
      this.playBeat(this.beat, this.nextBeatTime)
      this.nextBeatTime += BEAT
      this.beat++
    }
  }

  private playBeat(beat: number, time: number) {
    const bar = Math.floor(beat / 4) % CHORDS.length
    const inBar = beat % 4
    const offbeat = time + BEAT * SWING

    if (inBar === 0) this.chord(CHORDS[bar], time, BEAT * 3.6)
    if (inBar === 2 && beat % 8 === 6) this.chord(CHORDS[bar].slice(1), offbeat, BEAT * 1.2, 0.6)

    // walking-ish bass: root on 1, fifth on 3, a pickup before the next bar
    if (inBar === 0) this.bass(BASS[bar], time, BEAT * 1.8)
    if (inBar === 2) this.bass(BASS[bar] + 7, time, BEAT * 1.2)
    if (inBar === 3) this.bass(BASS[(bar + 1) % BASS.length] + 1, offbeat, BEAT * 0.4)

    // drums: lazy kick, rimmy snare on 2 and 4, swung hats
    if (inBar === 0 || (inBar === 2 && beat % 8 === 2)) this.kick(time)
    if (inBar === 1 || inBar === 3) this.snare(time)
    this.hat(time, 0.06)
    this.hat(offbeat, 0.035)

    // a sparse, wandering melody
    if (Math.random() < 0.45) {
      const note = MELODY_SCALE[Math.floor(Math.random() * MELODY_SCALE.length)]
      this.lead(note, Math.random() < 0.5 ? time : offbeat, BEAT * (0.6 + Math.random()))
    }
  }

  private out() {
    return this.master as GainNode
  }

  /** Electric-piano-ish voice: sine + soft triangle, slow tremolo, gentle strum. */
  private chord(notes: number[], time: number, length: number, velocity = 1) {
    const ctx = this.ctx as AudioContext
    notes.forEach((note, i) => {
      const start = time + i * 0.018
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, start)
      env.gain.linearRampToValueAtTime(0.055 * velocity, start + 0.02)
      env.gain.exponentialRampToValueAtTime(0.02 * velocity, start + 0.6)
      env.gain.exponentialRampToValueAtTime(0.0001, start + length)
      const tremolo = ctx.createGain()
      const lfo = ctx.createOscillator()
      const lfoDepth = ctx.createGain()
      lfo.frequency.value = 4.5
      lfoDepth.gain.value = 0.25
      lfo.connect(lfoDepth).connect(tremolo.gain)
      tremolo.gain.value = 0.75
      for (const [type, detune, gain] of [
        ['sine', 0, 1],
        ['triangle', 6, 0.35],
      ] as const) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.type = type
        osc.frequency.value = midiToHz(note)
        osc.detune.value = detune
        g.gain.value = gain
        osc.connect(g).connect(env)
        osc.start(start)
        osc.stop(start + length + 0.05)
      }
      env.connect(tremolo).connect(this.out())
      lfo.start(start)
      lfo.stop(start + length + 0.05)
    })
  }

  private bass(note: number, time: number, length: number) {
    const ctx = this.ctx as AudioContext
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToHz(note)
    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(0.22, time + 0.015)
    env.gain.exponentialRampToValueAtTime(0.001, time + length)
    osc.connect(env).connect(this.out())
    osc.start(time)
    osc.stop(time + length + 0.05)
  }

  private lead(note: number, time: number, length: number) {
    const ctx = this.ctx as AudioContext
    const osc = ctx.createOscillator()
    const vibrato = ctx.createOscillator()
    const vibratoDepth = ctx.createGain()
    const env = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = midiToHz(note)
    vibrato.frequency.value = 5
    vibratoDepth.gain.value = 3
    vibrato.connect(vibratoDepth).connect(osc.frequency)
    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(0.035, time + 0.05)
    env.gain.exponentialRampToValueAtTime(0.0005, time + length)
    osc.connect(env).connect(this.out())
    osc.start(time)
    vibrato.start(time)
    osc.stop(time + length + 0.05)
    vibrato.stop(time + length + 0.05)
  }

  private kick(time: number) {
    const ctx = this.ctx as AudioContext
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.frequency.setValueAtTime(110, time)
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12)
    env.gain.setValueAtTime(0.5, time)
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.35)
    osc.connect(env).connect(this.out())
    osc.start(time)
    osc.stop(time + 0.4)
  }

  private noiseHit(time: number, length: number, gain: number, filter: BiquadFilterType, frequency: number) {
    const ctx = this.ctx as AudioContext
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const f = ctx.createBiquadFilter()
    f.type = filter
    f.frequency.value = frequency
    const env = ctx.createGain()
    env.gain.setValueAtTime(gain, time)
    env.gain.exponentialRampToValueAtTime(0.0005, time + length)
    src.connect(f).connect(env).connect(this.out())
    src.start(time, Math.random())
    src.stop(time + length + 0.02)
  }

  private snare(time: number) {
    this.noiseHit(time, 0.18, 0.12, 'bandpass', 1800)
  }

  private hat(time: number, gain: number) {
    this.noiseHit(time, 0.05, gain, 'highpass', 7000)
  }

  /** Looping vinyl hiss with the occasional pop. */
  private startCrackle(ctx: AudioContext, master: GainNode) {
    const length = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015 + (Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.6 : 0)
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 3000
    f.Q.value = 0.5
    const g = ctx.createGain()
    g.gain.value = 0.5
    src.connect(f).connect(g).connect(master)
    src.start()
    this.crackle = src
  }

  private makeNoise(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }
}
