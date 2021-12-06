import domready from "domready"
import "./style.css"
import quadraticBezier from "./bezier";
import Vector from "./vector";
import Color from "./Color";


const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};


function randomPerimeter()
{

    const e = 0 | Math.random() * 4;

    const e2 = (e + 2) & 3

    const [sx0, sy0, dx0, dy0] = config.edges[e];
    const [sx1, sy1, dx1, dy1] = config.edges[e2];

    return [
        (sx0 + Math.random() * dx0) | 0,
        (sy0 + Math.random() * dy0) | 0,
        (sx1 + Math.random() * dx1) | 0,
        (sy1 + Math.random() * dy1) | 0,
    ]
}


/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

const tmp = new Vector(0, 0);


function norm(number)
{
    const n = number - (number | 0);
    return n < 0 ? 1 + n : n;
}


const harmonies = [1 / 3, 2 / 3, 1/6, 5/6]

const black = new Color(0, 0, 0)

let randomStyles

domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;
        config.edges = [
            [0, 0, width, 0],
            [width, 0, 0, height],
            [width, height, -width, 0],
            [width, 0, 0, -height]
        ]
        ;

        canvas.width = width;
        canvas.height = height;

        const lineWidth = 1;
        const multiplier = 70;



        const generate = () => {
            const hue = Math.random();
            const drawLayer = () => {
                let [x0, y0, x2, y2] = randomPerimeter();
                let x1 = 0 | Math.random() * width
                let y1 = 0 | Math.random() * height

                const drawBezier = (x0, y0, x1, y1, x2, y2) => {
                    ctx.beginPath();
                    for (let i = 0; i <= 1; i += 0.01)
                    {
                        quadraticBezier(x0, y0, x1, y1, x2, y2, i, tmp)

                        if (Math.random() < 0.1)
                        {
                            ctx.stroke()

                            ctx.strokeStyle = randomStyles[0|Math.random() * randomStyles.length]
                            let rnd = Math.random();
                            ctx.lineWidth = 0|(lineWidth * (rnd * rnd * rnd * 12 + 1))
                            ctx.beginPath()
                            ctx.moveTo(tmp.x, tmp.y)
                        }
                        else
                        {
                            if (i === 0)
                            {
                                ctx.moveTo(tmp.x, tmp.y)
                            }
                            else
                            {
                                ctx.lineTo(tmp.x, tmp.y)
                            }

                        }

                    }
                    ctx.lineTo(x2, y2)
                    ctx.stroke()
                };

                // ctx.fillStyle = "#f0f"
                // quadraticBezier( x0, y0, x1, y1, x2, y2, t, tmp)
                // ctx.fillRect(tmp.x-1,tmp.y-1,2,2)

                const midPointOnCurve = (x0, y0, x1, y1, x2, y2) => {
                    let xm = (x0 + x2) / 2
                    let ym = (y0 + y2) / 2

                    xm = xm + (x1 - xm) * 0.5
                    ym = ym + (y1 - ym) * 0.5

                    return [xm, ym]
                };

                drawBezier(x0, y0, x1, y1, x2, y2);

                const outside = (x, y) => x < -width || x >= width * 2 || y < -height || y >= height * 2;

                const [xm, ym] = midPointOnCurve(x0, y0, x1, y1, x2, y2)

                let dx = x1 - xm
                let dy = y1 - ym

                const len = Math.sqrt(dx * dx + dy * dy)
                const f = lineWidth * multiplier / len;
                dx *= f
                dy *= f

                let i = 1;
                let xm0, ym0
                let xm1, ym1
                do
                {
                    let x10 = x0 + dy * i;
                    let y10 = y0 - dx * i;
                    let x20 = x0 - dy * i;
                    let y20 = y0 + dx * i;
                    let x11 = x1 + dx * i;
                    let y11 = y1 + dy * i;
                    let x21 = x1 - dx * i;
                    let y21 = y1 - dy * i;
                    let x12 = x2 - dy * i;
                    let y12 = y2 + dx * i;
                    let x22 = x2 + dy * i;
                    let y22 = y2 - dx * i;
                    drawBezier(x10, y10, x11, y11, x12, y12)
                    drawBezier(x20, y20, x21, y21, x22, y22)

                    i += 0.2 + Math.random() * 0.8

                    let m0 = midPointOnCurve(x0, y0, x11, y11, x2, y2);
                    let m1 = midPointOnCurve(x0, y0, x21, y21, x2, y2);
                    xm0 = m0[0]
                    ym0 = m0[1]
                    xm1 = m1[0]
                    ym1 = m1[1]
                } while (!outside(xm0, ym0) || !outside(xm1, ym1))
            };


            ctx.lineWidth = lineWidth


            function randomStyle()
            {
                const style = Math.random();

                if (style < 0.333)
                {
                    return Color.fromHSL(hue, 1, 0.5).toRGBA(0.9)
                }
                else if (style < 0.666)
                {

                    let col0 = Color.fromHSL(hue, 1, 0.5);
                    let col1 = Color.fromHSL(norm(hue + harmonies[0 | Math.random() * harmonies.length]), 1, 0.5);

                    const left = Math.random() < 0.5;

                    const gradient = ctx.createLinearGradient(left ? 0 : width,0, left ? width : 0,0)
                    gradient.addColorStop(0,col0.toRGBA(0.6))
                    gradient.addColorStop(1,col1.toRGBA(0.8))

                    return gradient
                }
                else
                {

                    let col0 = Color.fromHSL(hue, 1, 0.5);
                    let col1 = Color.fromHSL(norm(hue + harmonies[0 | Math.random() * harmonies.length]), 1, 0.5);

                    const size = Math.max(width,height)

                    const e = config.edges[0|Math.random() * config.edges.length]
                    const gradient = ctx.createRadialGradient(e[0], e[1], size, e[0], e[1], 0)
                    gradient.addColorStop(0,col0.toRGBA(0.6))
                    gradient.addColorStop(1,col1.toRGBA(0.8))
                    return gradient

                }
            }

            const count = Math.round(2 + Math.random() * 3)
            randomStyles = []
            for (let i = 0; i < count; i++)
            {
                randomStyles.push(randomStyle())
            }

            const bg0 = Color.fromHSL(norm(hue + harmonies[0 | Math.random() * harmonies.length]), 1, 0.5)
            const bg1 = Color.fromHSL(norm(hue + harmonies[0 | Math.random() * harmonies.length]), 1, 0.5)

            const gradient = ctx.createLinearGradient(0, 0, 0, height)
            gradient.addColorStop(0, bg0.mix(black, 0.95).toRGBHex())
            gradient.addColorStop(1, bg1.mix(black, 0.75).toRGBHex())

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = randomStyles[0 | Math.random() * randomStyles.length]
            drawLayer();
        };


        generate()

        window.addEventListener("click", generate, true)

    }
);
