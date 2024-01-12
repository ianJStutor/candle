import fullscreenCanvas from "./fullscreenCanvas.js";
import watchOrientation from "./watchOrientation.js";
import watchTouches from "./watchTouches.js";
import watchAudio from "./watchAudio.js";
import Candle from "./candle.js";
import { degToRad } from "./lib.js";

const ctx = fullscreenCanvas();
const orientation = watchOrientation();
const touches = watchTouches();
const candle = new Candle(ctx, { color: "mintcream" });
const flameSize = Math.min(ctx.canvas.width, ctx.canvas.height) * 1/5;
const targetFPS = 1000/60; // 16.6667 ms per frame

var audioAnalyzer;
watchAudio(analyzer => {
    audioAnalyzer = analyzer;
    audioAnalyzer.minDecibels = -90;
    audioAnalyzer.maxDecibels = -10;
    audioAnalyzer.smoothingTimeConstant = 0.85;
    audioAnalyzer.fftSize = 256;
});

var animating = true;
var oldT;
var normTimeMin;
var normTimeMax;
requestAnimationFrame(loop);
function loop(t) {
    //FPS (calculate normalized time elapsed since previous frame)
    const normTime = (t - (oldT ?? t))/targetFPS;
    if (!normTimeMin || normTime < normTimeMin) normTimeMin = normTime;
    if (!normTimeMax || normTime > normTimeMax) normTimeMax = normTime;
    oldT = t;
    //dimensions
    const { width, height } = ctx.canvas;
    //erase
    ctx.clearRect(0, 0, width, height);
    //normTime reporting & particle count
    {
        ctx.fillStyle = "white";
        ctx.font = "16px Ariel";
        ctx.fillText(`tmin: ${normTimeMin}`, 5, 21);
        ctx.fillText(`tmax: ${normTimeMax}`, 5, 42);
        ctx.fillText(`p: ${candle.getParticleCount()}`, 5, 63);
    }
    //orientation testing
    {
        const { alpha, beta, gamma } = orientation;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "16px Ariel";
        ctx.fillText(`α: ${degToRad(alpha)}`, 5, 84);
        ctx.fillText(`β: ${degToRad(beta)}`, 5, 105);
        ctx.fillText(`γ: ${degToRad(gamma)}`, 5, 126);
        ctx.restore();
    }
    //touch testing
    {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "14px Ariel";
        for (let { clientX, clientY, radiusX, radiusY, rotationAngle, force } of touches) {
            ctx.fillStyle = "#FFCCCC88";
            ctx.beginPath();
            ctx.ellipse(clientX, clientY, Math.max(radiusX, 10), Math.max(radiusY, 10), rotationAngle, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.fillText(force, clientX, clientY);
        }
        ctx.restore();
    }
    //audio testing
    {
        if (audioAnalyzer) {
            const bufferLength = audioAnalyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            audioAnalyzer.getByteFrequencyData(dataArray);
            ctx.save();
            // const len = Math.floor(bufferLength/2);
            const blowTolerances = [
                130, 140, 140, 100, 100, 80, 70, 65, 65, 55,
                55, 45, 45, 40, 40, 35, 30, 40, 40, 35, 35, 30, 25,
                25, 35, 35, 40, 40, 30, 25, 20, 10, 10, 10, 10, 10,
                10, 10, 5
            ];
            const len = blowTolerances.length;
            let isBlow = true;
            for (let i=0; i<len; i++) {
                ctx.fillStyle = "pink";
                if (blowTolerances[i]) {
                    if (dataArray[i] >= blowTolerances[i]) {
                        ctx.fillStyle = "lime";
                    }
                    else isBlow = false;
                }
                ctx.fillRect(width - 15 - len*2 + i*2, 5, 1, Math.max(1, dataArray[i]/2));
            }
            if (isBlow) {
                candle.reset(2000); //will extinguish then relight after 2 seconds
            }
            ctx.restore();
        }
    }
    //candle
    const gamma = Math.max(Math.min(degToRad(orientation.gamma), 0.65), -0.65) +Math.PI/2;
    candle.settings({ flameEnd: {
        x: (width * 0.5) + Math.cos(-gamma) * flameSize,
        y: (height * 0.5) + Math.sin(-gamma) * flameSize
    } });
    candle.draw(normTime);
    //repeat
    if (animating) requestAnimationFrame(loop);
};