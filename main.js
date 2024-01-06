import fullscreenCanvas from "./fullscreenCanvas.js";
import watchOrientation from "./watchOrientation.js";
import watchTouches from "./watchTouches.js";
import Candle from "./candle.js";
import { degToRad } from "./lib.js";

const ctx = fullscreenCanvas();
const orientation = watchOrientation();
const touches = watchTouches();
const candle = new Candle(ctx, { color: "mintcream" });
const flameSize = Math.min(ctx.canvas.width, ctx.canvas.height) * 1/5;
const targetFPS = 1000/60; // 60 frames per second

var animating = true;
var oldT;
requestAnimationFrame(loop);
function loop(t) {
    //FPS (calculate normalized time elapsed since previous frame)
    const normTime = (t - (oldT ?? t))/targetFPS;
    oldT = t;
    //dimensions
    const { width, height } = ctx.canvas;
    //erase
    ctx.clearRect(0, 0, width, height);
    //orientation testing
    {
        const { alpha, beta, gamma } = orientation;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = "16px Ariel";
        ctx.fillText(`α: ${degToRad(alpha)}`, 5, 21);
        ctx.fillText(`β: ${degToRad(beta)}`, 5, 42);
        ctx.fillText(`γ: ${degToRad(gamma)}`, 5, 63);
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