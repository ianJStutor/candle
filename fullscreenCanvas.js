console.log("fullscreenCanvas.js");

export default function fullscreenCanvas(selector = "canvas") {
    try {
        // get canvas element
        if (!window || !document) throw new Error("Not a browser environment");
        const canvasElement = document.querySelector?.(selector);
        if (!canvasElement) throw new Error(`No HTML element with the selector ${selector}`);
        const ctx = canvasElement.getContext?.("2d");
        if (!ctx) throw new Error(`Not a canvas HTML element, selector ${selector}`);

        // size to full screen, even on window resize
        function resizeCanvas() {
            const { innerWidth, innerHeight } = window;
            canvasElement.width = innerWidth;
            canvasElement.height = innerHeight;
        }
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // return context
        return ctx;
    }
    catch (e) {
        return console.error(e);
    }    
}