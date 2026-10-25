// A tiny lofi jazz generator built on the Web Audio API.
// Everything is synthesized in the browser (Rhodes-style chords, upright-ish bass, brushed drums,
// vinyl crackle), so there are no audio files to host and no licensing to track.
//
// The song is rendered once into a seamless loop and played with a looping buffer source,
// so it keeps going forever (background tabs, throttled timers and all) until stop() is called.

const BPM = 72
const BEAT = 60 / BPM
const SWING = 0.62 // share of the beat taken by the first eighth note
const BARS = 8 // ~27 s before the loop repeats
const TAIL = 3 // seconds of ringing notes folded back onto the start for a seamless loop
const SAMPLE_RATE = 44100

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

/** Small seeded random so every visitor hears the same melody. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

function noiseBuffer(ctx: BaseAudioContext, seconds: number, crackle = false) {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = crackle
      ? (Math.random() * 2 - 1) * 0.015 + (Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.6 : 0)
      : Math.random() * 2 - 1
  }
  return buffer
}

/** Schedules the instruments into any audio context (here, an offline one for rendering). */
class Band {
  private readonly noise: AudioBuffer

  constructor(
    private readonly ctx: BaseAudioContext,
    private readonly out: AudioNode,
  ) {
    this.noise = noiseBuffer(ctx, 2)
  }

  playSong() {
    const random = seeded(7)
    for (let beat = 0; beat < BARS * 4; beat++) this.playBeat(beat, beat * BEAT, random)
  }

  private playBeat(beat: number, time: number, random: () => number) {
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
    if (random() < 0.45) {
      const note = MELODY_SCALE[Math.floor(random() * MELODY_SCALE.length)]
      this.lead(note, random() < 0.5 ? time : offbeat, BEAT * (0.6 + random()))
    }
  }

  /** Electric-piano-ish voice: sine + soft triangle, slow tremolo, gentle strum. */
  private chord(notes: number[], time: number, length: number, velocity = 1) {
    const { ctx } = this
    notes.forEach((note, i) => {
      const start = time + i * 0.018
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, start)
      env.gain.linearRampToValueAtTime(0.055 * velocity, start + 0.02)
      env.gain.exponentialRampToValueAtTime(0.02 * velocity, start + 0.6)
      env.gain.exponentialRampToValueAtTime(0.0001, start + length)
      const tremolo = ctx.createGain()
      tremolo.gain.value = 0.75
      const lfo = ctx.createOscillator()
      const lfoDepth = ctx.createGain()
      lfo.frequency.value = 4.5
      lfoDepth.gain.value = 0.25
      lfo.connect(lfoDepth).connect(tremolo.gain)
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
      env.connect(tremolo).connect(this.out)
      lfo.start(start)
      lfo.stop(start + length + 0.05)
    })
  }

  private bass(note: number, time: number, length: number) {
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToHz(note)
    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(0.22, time + 0.015)
    env.gain.exponentialRampToValueAtTime(0.001, time + length)
    osc.connect(env).connect(this.out)
    osc.start(time)
    osc.stop(time + length + 0.05)
  }

  private lead(note: number, time: number, length: number) {
    const { ctx } = this
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
    osc.connect(env).connect(this.out)
    osc.start(time)
    vibrato.start(time)
    osc.stop(time + length + 0.05)
    vibrato.stop(time + length + 0.05)
  }

  private kick(time: number) {
    const osc = this.ctx.createOscillator()
    const env = this.ctx.createGain()
    osc.frequency.setValueAtTime(110, time)
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12)
    env.gain.setValueAtTime(0.5, time)
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.35)
    osc.connect(env).connect(this.out)
    osc.start(time)
    osc.stop(time + 0.4)
  }

  private noiseHit(time: number, length: number, gain: number, filter: BiquadFilterType, frequency: number) {
    const src = this.ctx.createBufferSource()
    src.buffer = this.noise
    const f = this.ctx.createBiquadFilter()
    f.type = filter
    f.frequency.value = frequency
    const env = this.ctx.createGain()
    env.gain.setValueAtTime(gain, time)
    env.gain.exponentialRampToValueAtTime(0.0005, time + length)
    src.connect(f).connect(env).connect(this.out)
    src.start(time, (time * 7.3) % 1.5)
    src.stop(time + length + 0.02)
  }

  private snare(time: number) {
    this.noiseHit(time, 0.18, 0.12, 'bandpass', 1800)
  }

  private hat(time: number, gain: number) {
    this.noiseHit(time, 0.05, gain, 'highpass', 7000)
  }
}

/** Renders the whole song offline, then folds the ringing tail onto the start so it loops cleanly. */
async function renderLoop(): Promise<AudioBuffer> {
  const loopSeconds = BARS * 4 * BEAT
  const offline = new OfflineAudioContext(1, Math.ceil((loopSeconds + TAIL) * SAMPLE_RATE), SAMPLE_RATE)
  new Band(offline, offline.destination).playSong()
  const rendered = await offline.startRendering()

  const loopLength = Math.round(loopSeconds * SAMPLE_RATE)
  const loop = new AudioBuffer({ length: loopLength, numberOfChannels: 1, sampleRate: SAMPLE_RATE })
  const source = rendered.getChannelData(0)
  const target = loop.getChannelData(0)
  target.set(source.subarray(0, loopLength))
  for (let i = loopLength; i < source.length; i++) target[i - loopLength] += source[i]
  return loop
}

export class LofiPlayer {
  private ctx: AudioContext | null = null
  private loop: Promise<AudioBuffer> | null = null
  private master: GainNode | null = null
  private analyser: AnalyserNode | null = null
  private sources: AudioBufferSourceNode[] = []
  private active = false
  private levels = new Uint8Array(0)

  get playing() {
    return this.active
  }

  /** Render the song ahead of time (no user gesture needed) so pressing play is instant. */
  prepare() {
    this.loop ??= renderLoop()
    return this.loop
  }

  async start() {
    if (this.active) return
    this.active = true
    const ctx = (this.ctx ??= this.createContext())
    await ctx.resume()
    const loop = await this.prepare()
    if (!this.active) return // stopped while the loop was rendering

    // master chain: gain → warm low-pass → gentle compression → speakers (+ analyser tap)
    const master = ctx.createGain()
    master.gain.setValueAtTime(0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 1.5)
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

    const song = ctx.createBufferSource()
    song.buffer = loop
    song.loop = true
    song.connect(master)
    const crackle = ctx.createBufferSource()
    crackle.buffer = noiseBuffer(ctx, 4, true)
    crackle.loop = true
    const hiss = ctx.createBiquadFilter()
    hiss.type = 'bandpass'
    hiss.frequency.value = 3000
    hiss.Q.value = 0.5
    crackle.connect(hiss).connect(master)
    song.start()
    crackle.start()

    this.master = master
    this.analyser = analyser
    this.levels = new Uint8Array(analyser.fftSize)
    this.sources = [song, crackle]
  }

  stop() {
    if (!this.active) return
    this.active = false
    const { ctx, master, sources } = this
    this.master = null
    this.analyser = null
    this.sources = []
    if (!ctx || !master) return
    const now = ctx.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setValueAtTime(master.gain.value, now)
    master.gain.linearRampToValueAtTime(0, now + 0.6)
    window.setTimeout(() => {
      sources.forEach((source) => source.stop())
      master.disconnect()
    }, 700)
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

  /** Browsers can suspend audio (tab switches, device changes); pick back up while still on. */
  private createContext() {
    const ctx = new AudioContext()
    const resume = () => {
      if (this.active && ctx.state !== 'running' && ctx.state !== 'closed') void ctx.resume()
    }
    ctx.addEventListener('statechange', resume)
    document.addEventListener('visibilitychange', resume)
    window.addEventListener('pointerdown', resume)
    return ctx
  }
}
