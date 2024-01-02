export default function watchTouches() {
    const touches = [];
    window?.addEventListener("touchstart", handleTouch);
    window?.addEventListener("touchmove", handleTouch);
    window?.addEventListener("touchend", handleTouch);
    window?.addEventListener("touchcancel", handleTouch);
    function handleTouch(e) {
        touches.length = 0;
        touches.push(...e.touches);
    }
    return touches;
}