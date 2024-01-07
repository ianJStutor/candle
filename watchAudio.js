console.log("watchAudio.js");

export default async function watchAudio(callback = () => {}) {
    if (!navigator?.mediaDevices?.getUserMedia) return console.error("navigator.mediaDevices.getUserMedia() not supported");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyzer = audioCtx.createAnalyser(); //British spelling!!!
        source.connect(analyzer);
        callback(analyzer);
    }
    catch (e) { console.error(e); }
}
