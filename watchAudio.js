console.log("watchAudio.js");

export default async function watchAudio(callback = () => {}) {
    if (!navigator?.mediaDevices?.getUserMedia) return console.error("navigator.mediaDevices.getUserMedia() not supported");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser(); //British spelling!!!
        analyzer.minDecibels = -90;
        analyzer.maxDecibels = -10;
        analyzer.smoothingTimeConstant = 0.85;
        source.connect(analyzer);
        analyzer.fftSize = 256;
        callback(analyzer);
    }
    catch (e) { console.error(e); }
}
