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
            numParticles: 1000, //total particles in pool (target)
            batch: 25, //create particles in batches
            rMultiplier: 0.9, //particle radius change per frame
            vxMultiplier: 0.95, //particle x movement change per frame
            vyMultiplier: 0.99, //particle y movement change per frame
            maxLife: 25, //frames before respawn
            minSpeed: 2, //pixels per frame
            maxSpeed: 6, //pixels per frame
            minRadius: Math.max(width/35, 12), //pixels
            maxRadius: Math.max(width/25, 20), //pixels
            minAngle: -Math.PI, //radians
            maxAngle: 0, //radians
            minHue: -30, //reddish in hsl gamut
            maxHue: 60, //yellowish in hsl gamut
            tailLength: 5, //number of previous points to track
            wickWidth: Math.max(width/100, 3)
        }, overrides);
        this.ignite();
    }
    settings(overrides = {}) {
        this.options = Object.assign(this.options, overrides);
    }
    ignite() {
        this.flame = new CandleFlame(this.ctx, this.options);
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
    reset(ms) {
        this.flame.extinguish();
        setTimeout(() => this.ignite(), ms);
    }
    getParticleCount() { return this.flame.getParticleCount(); }
}

class CandleFlame {
    #toleranceMaxFPS = 1.25; //if normTime is greater, reduce numParticles
    #toleranceMinFPS = 0.9; //if normTime is less, add to numParticles
    #numParticles;
    #particles = [];
    #animate = true;

    constructor(ctx, options) {
        this.ctx = ctx;
        this.options = options;
        this.#numParticles = options.numParticles;
    }
    getParticleCount() { return this.#particles.length; }
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
        const prev = [{x, y}];
        const life = maxLife;
        const particle = { x, y, prev, vx, vy, r, hue, life, maxLife };
        if (p) p = Object.assign(p, particle);
        else this.#particles.push(particle);
    }
    #update(normTime) {
        const { numParticles, batch, flameEnd, tailLength,                rMultiplier, vxMultiplier, vyMultiplier } = this.options;
        //slow FPS?
        {
            this.#numParticles = Math.min(this.#numParticles, numParticles);
            if (normTime >= this.#toleranceMaxFPS) 
                this.#numParticles = Math.max(this.#numParticles-10, 0);
            else if (normTime <= this.#toleranceMinFPS)
                this.#numParticles = Math.min(this.#numParticles+10, numParticles);
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
                p.prev.push({x: p.x, y: p.y});
                if (p.prev.length > tailLength) p.prev.shift();
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
        if (!this.#animate) return;
        this.#update(normTime);
        const { ctx } = this;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        for (let { x, y, prev, r, hue } of this.#particles) {
            ctx.strokeStyle = `hsla(${hue}deg, 100%, 15%, 0.25)`;
            ctx.lineWidth = r;
            ctx.beginPath();
            ctx.moveTo(prev[0].x, prev[0].y);
            for (let i=1; i<prev.length; i++) {
                ctx.lineTo(prev[i].x, prev[i].y);
            }
            ctx.lineTo(x, y);
            ctx.stroke();
        }
        ctx.restore();
    }
    extinguish() {
        this.#animate = false;
        this.#particles = [];
    }
}