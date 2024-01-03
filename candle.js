export default class Candle {
    constructor(ctx, overrides = {}) {
        this.ctx = ctx;
        this.options = Object.assign({
            x: 0, //candle upper left x
            y: 50, //candle upper left y
            w: 100, //cande width
            h: 100, //candle height
            flameStart: { x: 50, y: 50 }, //particle spawn position
            flameEnd: { x: 50, y: 0 }, //particle focus position
            color: "white", //candle color
            numParticles: 2500, //total particles in pool
            batch: 25, //create particles in batches
            deltaR: -0.8, //particle size change per frame
            vxMultiplier: 0.9, //particle x movement change per frame
            vyMultiplier: 0.99, //particle y movement change per frame
            maxLife: 200, //frames before respawn
            minSpeed: 3, //pixels per frame
            maxSpeed: 10, //pixels per frame
            minRadius: 15, //pixels
            maxRadius: 35, //pixels
            minAngle: -Math.PI, //radians
            maxAngle: 0, //radians
            minHue: -30, //reddish in hsl gamut
            maxHue: 60, //yellowish in hsl gamut
        }, overrides);
        // this.flame = new CandleFlame(this.options);
    }
    settings(overrides = {}) {
        this.options = Object.assign(this.options, overrides);
    }
    draw() {
        const { ctx } = this;
        const { x, y, w, h, color, flameStart, flameEnd } = this.options;
        {
            //testing only...
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = "red";
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.moveTo(flameStart.x, flameStart.y);
            ctx.lineTo(flameEnd.x, flameEnd.y);
            ctx.stroke();
        }
    }
}

// class CandleFlame {
//     constructor() {

//     }
// }