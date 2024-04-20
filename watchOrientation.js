export default function watchOrientation() {
    const orientation = { absolute: true, alpha: 0, beta: 90, gamma: 0 };
    window?.addEventListener("deviceorientation", ({ absolute, alpha, beta, gamma }) => {
        orientation.absolute = absolute;
        orientation.alpha = alpha;
        orientation.beta = beta;
        orientation.gamma = gamma;
    });
    return orientation;
}
