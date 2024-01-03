import fullscreenCanvas from "./fullscreenCanvas.js";
import watchOrientation from "./watchOrientation.js";
import watchTouches from "./watchTouches.js";
import Candle from "./candle.js";

const ctx = fullscreenCanvas();
const orientation = watchOrientation();
const touches = watchTouches();
const candle = new Candle(ctx, { x: ctx.canvas.width/4, y: ctx.canvas.height/2, w: ctx.canvas.width/2, h: ctx.canvas.height/2, flameStart: {x: ctx.canvas.width/2, y: ctx.canvas.height/2}, flameEnd: {x: ctx.canvas.width/2, y: ctx.canvas.height/5} });

var animating = true;
requestAnimationFrame(loop);
function loop() {
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
        ctx.fillText(`α: ${alpha}`, 5, 21);
        ctx.fillText(`β: ${beta}`, 5, 42);
        ctx.fillText(`γ: ${gamma}`, 5, 63);
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
            ctx.ellipse(clientX, clientY, radiusX, radiusY, rotationAngle, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.fillText(force, clientX, clientY);
        }
        ctx.restore();
    }
    //candle
    candle.draw();
    //repeat
    if (animating) requestAnimationFrame(loop);
};