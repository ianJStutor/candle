export function degToRad(deg) {
    return deg * Math.PI / 180;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}