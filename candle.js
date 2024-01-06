import { lerp } from "./lib.js";

export default class Candle {
    constructor(ctx, overrides = {}) {
        this.ctx = ctx;
        const { width, height } = ctx.canvas;
        this.options = Object.assign({
            x: width/4, //candle upper left x
            y: height/2, //candle upper left y
            w: width/2, //cande width
            h: height/2, //candle height
            flameStart: { x: width/2, y: height/2 }, //particle spawn position
            flameEnd: { x: width/2, y: 0 }, //particle focus position
            color: "white", //candle color
            numParticles: 2500, //total particles in pool (target)
            batch: 50, //create particles in batches
            rMultiplier: 0.9, //particle radius change per frame
            vxMultiplier: 0.95, //particle x movement change per frame
            vyMultiplier: 0.99, //particle y movement change per frame
            maxLife: 25, //frames before respawn
            minSpeed: 2, //pixels per frame
            maxSpeed: 6, //pixels per frame
            minRadius: Math.max(width/35, 10), //pixels
            maxRadius: Math.max(width/25, 15), //pixels
            minAngle: -Math.PI, //radians
            maxAngle: 0, //radians
            minHue: -30, //reddish in hsl gamut
            maxHue: 60, //yellowish in hsl gamut
            wickWidth: Math.max(width/100, 3)
        }, overrides);
        this.flame = new CandleFlame(this.ctx, this.options);
    }
    settings(overrides = {}) {
        this.options = Object.assign(this.options, overrides);
    }
    draw(normTime) { //normalized time based on target FPS
        const { ctx } = this;
        const { width, height } = ctx.canvas;
        const { x, y, w, h, color, flameStart, maxRadius, wickWidth } = this.options;
        //candle
        const gradient = ctx.createLinearGradient(x, y+h/2, x+w, y+h/2);
        gradient.addColorStop(0, "#000000dd");
        gradient.addColorStop(0.05, color);
        gradient.addColorStop(0.95, color);
        gradient.addColorStop(1, "#000000dd");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x+w, height);
        ctx.lineTo(x, height);
        ctx.lineTo(x, y);
        ctx.quadraticCurveTo(flameStart.x, flameStart.y+maxRadius*2, x+w, y);
        ctx.closePath();
        ctx.fill();
        //flame
        this.flame.draw(normTime);
        //wick
        ctx.strokeStyle = "#00000033";
        ctx.lineWidth = wickWidth;
        ctx.beginPath();
        ctx.moveTo(flameStart.x, flameStart.y);
        ctx.lineTo(flameStart.x, flameStart.y+maxRadius);
        ctx.stroke();
    }
}

class CandleFlame {
    #toleranceFPS = 1.25; //if normTime is greater, reduce numParticles
    #numParticles;
    #particles = [];

    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options;
        this.#numParticles = options.numParticles;
    }
    #addParticle(p) {
        const {
            maxLife, minSpeed, maxSpeed, minRadius, maxRadius,
            minAngle, maxAngle, minHue, maxHue, flameStart
        } = this.options;
        const speed = lerp(minSpeed, maxSpeed, Math.random());
        const angle = lerp(minAngle, maxAngle, Math.random());
        const r = lerp(minRadius, maxRadius, Math.random());
        const hue = Math.floor(lerp(minHue, maxHue, Math.random()));
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const x = flameStart.x;
        const y = flameStart.y;
        const prevX = x;
        const prevY = y;
        const life = maxLife;
        const particle = { x, y, prevX, prevY, vx, vy, r, hue, life, maxLife };
        if (p) p = Object.assign(p, particle);
        else this.#particles.push(particle);
    }
    #update(normTime) {
        const { numParticles, batch, flameEnd,
                rMultiplier, vxMultiplier, vyMultiplier } = this.options;
        //slow FPS?
        {
            this.#numParticles = Math.min(this.#numParticles, numParticles);
            if (normTime >= this.#toleranceFPS) this.#numParticles -= batch;
        }
        //add particle?
        {
            const length = this.#particles.length;
            if (length < this.#numParticles) {
                const newBatch = Math.min(batch, this.#numParticles - length);
                for (let i=0; i<newBatch; i++) this.#addParticle();
            }
        }
        //update particles
        {
            for (let i=this.#particles.length-1; i>=0; i--) {
                let p = this.#particles[i];
                p.prevX = p.x;
                p.prevY = p.y;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= vxMultiplier;
                p.vy *= vyMultiplier;
                p.r *= rMultiplier;
                p.life--;
                //remove or reset?
                if (p.life <= 0 || p.r < 1) {
                    if (this.#particles.length > this.#numParticles)
                        this.#particles.splice(i, 1);
                    else this.#addParticle(p);
                }
                //move toward flameEnd
                else {
                    const norm = (p.maxLife - p.life) / p.maxLife;
                    p.x = lerp(p.x, flameEnd.x, norm);
                    p.y = lerp(p.y, flameEnd.y, norm);
                }
            }
        }
    }
    draw(normTime) {
        this.#update(normTime);
        const { ctx } = this;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (let { x, y, prevX, prevY, r, hue } of this.#particles) {
            ctx.strokeStyle = `hsla(${hue}deg, 100%, 15%, 0.25)`;
            ctx.lineWidth = r;
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.restore();
    }
}