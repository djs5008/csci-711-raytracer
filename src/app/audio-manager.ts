export default class AudioManager {
    private stream      : MediaStream;
    private context     : AudioContext = null;
    private source      : MediaStreamAudioSourceNode = null;
    private analyser    : AnalyserNode = null;
    private gainNode    : GainNode = null;
    public muted        : boolean = false;
    public barHeights   : Array<number> = [];

    constructor() {
        this.setup().catch(console.error);
    }

    async setup() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            this.context = new AudioContext();
            this.analyser = this.context.createAnalyser();
            this.analyser.minDecibels = -90;
            this.analyser.maxDecibels = -10;
            this.analyser.smoothingTimeConstant = 0.85;
            this.gainNode = this.context.createGain();
            this.gainNode.gain.value = 1;
            this.source = this.context.createMediaStreamSource(this.stream);
            this.source.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            this.updateBarHeights();
        } catch {
            console.error('error: failed to get access to microphone...');
        }
    }

    updateBarHeights() {
        if (this.analyser != null) {
            this.analyser.fftSize = 8192;
            const bufferLengthAlt = this.analyser.frequencyBinCount;
            const dataArrayAlt = new Uint8Array(bufferLengthAlt);
            this.analyser.getByteFrequencyData(dataArrayAlt);
            for (let i = 0; i < bufferLengthAlt; i++) {
                this.barHeights[i] = (dataArrayAlt[i]/255)*25;
            }
        }
    }

    toggleMute() {
        this.gainNode.gain.value = Number(!this.gainNode.gain.value);
        this.muted = !this.muted;
        if (this.muted) {
            this.stream.getAudioTracks().forEach((audio) => audio.stop());
        } else {
            this.setup();
        }
    }
}
