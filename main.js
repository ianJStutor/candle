import fullscreenCanvas from "./fullscreenCanvas.js";
import watchOrientation from "./watchOrientation.js";
import watchTouches from "./watchTouches.js";

const ctx = fullscreenCanvas();
const orientation = watchOrientation();
const touches = watchTouches();

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
    //repeat
    if (animating) requestAnimationFrame(loop);
};