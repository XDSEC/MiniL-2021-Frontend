<template>
    <div class="container">
        <div id="bg">
            <canvas></canvas>
            <canvas></canvas>
            <canvas></canvas>
        </div>
        <ul class="bubble-list">
            <li class="bubble bubble1"></li>
            <li class="bubble bubble2"></li>
            <li class="bubble bubble3"></li>
            <li class="bubble bubble4"></li>
            <li class="bubble bubble5"></li>
        </ul>
        <div id="minil-logo">
            <img src="static/images/minil-square-transparent.png" alt="minil-logo" width="500px">
        </div>
        <div id="minil-title">
            <img src="static/images/minil-font-small.png" alt="minil-title" width="500px">
        </div>
        <div class="jump-button" @click="start">
            <div class="button-text">Start Hacking <3</div>
        </div>
    </div>
</template>

<script>
import jQuery from 'jquery'
export default {
    components: {},
    data() {
        return {
            countDownTime: "尚未开始",
            html: ""
        };
    },
    methods: {
        jump(url) {
            window.open(url);
        },
        start() {
            this.$router.push("/login");
        }
    },
    mounted() {
        (function ($) {
            var canvas = $('#bg').children('canvas'),
                background = canvas[0],
                foreground1 = canvas[1],
                foreground2 = canvas[2],
                config = {
                    circle: {
                        amount: 18,
                        layer: 3,
                        color: [157, 97, 207],
                        alpha: 0.3
                    },
                    line: {
                        amount: 12,
                        layer: 3,
                        color: [255, 255, 255],
                        alpha: 0.3
                    },
                    speed: 0.5,
                    angle: 20
                };

            if (background.getContext) {
                var bctx = background.getContext('2d'),
                    fctx1 = foreground1.getContext('2d'),
                    fctx2 = foreground2.getContext('2d'),
                    M = window.Math, // Cached Math
                    degree = config.angle / 360 * M.PI * 2,
                    circles = [],
                    lines = [],
                    wWidth, wHeight, timer;

                requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    function (callback, element) {
                        setTimeout(callback, 1000 / 60);
                    };

                cancelAnimationFrame = window.cancelAnimationFrame ||
                    window.mozCancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    window.msCancelAnimationFrame ||
                    window.oCancelAnimationFrame ||
                    clearTimeout;

                var setCanvasHeight = function () {
                    wWidth = $(window).width();
                    wHeight = $(window).height(),

                        canvas.each(function () {
                            this.width = wWidth;
                            this.height = wHeight;
                        });
                };

                var drawCircle = function (x, y, radius, color, alpha) {
                    var gradient = fctx1.createRadialGradient(x, y, radius, x, y, 0);
                    gradient.addColorStop(0, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')');
                    gradient.addColorStop(1, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (alpha - 0.1) + ')');

                    fctx1.beginPath();
                    fctx1.arc(x, y, radius, 0, M.PI * 2, true);
                    fctx1.fillStyle = gradient;
                    fctx1.fill();
                };

                var drawLine = function (x, y, width, color, alpha) {
                    var endX = x + M.sin(degree) * width,
                        endY = y - M.cos(degree) * width,
                        gradient = fctx2.createLinearGradient(x, y, endX, endY);
                    gradient.addColorStop(0, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + alpha + ')');
                    gradient.addColorStop(1, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (alpha - 0.1) + ')');

                    fctx2.beginPath();
                    fctx2.moveTo(x, y);
                    fctx2.lineTo(endX, endY);
                    fctx2.lineWidth = 3;
                    fctx2.lineCap = 'round';
                    fctx2.strokeStyle = gradient;
                    fctx2.stroke();
                };

                var drawBack = function () {
                    bctx.clearRect(0, 0, wWidth, wHeight);

                    var gradient = [];

                    gradient[0] = bctx.createRadialGradient(wWidth * 0.3, wHeight * 0.1, 0, wWidth * 0.3, wHeight * 0.1, wWidth * 0.9);
                    gradient[0].addColorStop(0, 'rgb(0, 26, 77)');
                    gradient[0].addColorStop(1, 'transparent');

                    bctx.translate(wWidth, 0);
                    bctx.scale(-1, 1);
                    bctx.beginPath();
                    bctx.fillStyle = gradient[0];
                    bctx.fillRect(0, 0, wWidth, wHeight);

                    gradient[1] = bctx.createRadialGradient(wWidth * 0.1, wHeight * 0.1, 0, wWidth * 0.3, wHeight * 0.1, wWidth);
                    gradient[1].addColorStop(0, 'rgb(0, 150, 240)');
                    gradient[1].addColorStop(0.8, 'transparent');

                    bctx.translate(wWidth, 0);
                    bctx.scale(-1, 1);
                    bctx.beginPath();
                    bctx.fillStyle = gradient[1];
                    bctx.fillRect(0, 0, wWidth, wHeight);

                    gradient[2] = bctx.createRadialGradient(wWidth * 0.1, wHeight * 0.5, 0, wWidth * 0.1, wHeight * 0.5, wWidth * 0.5);
                    gradient[2].addColorStop(0, 'rgb(40, 20, 105)');
                    gradient[2].addColorStop(1, 'transparent');

                    bctx.beginPath();
                    bctx.fillStyle = gradient[2];
                    bctx.fillRect(0, 0, wWidth, wHeight);
                };

                var animate = function () {
                    var sin = M.sin(degree),
                        cos = M.cos(degree);

                    if (config.circle.amount > 0 && config.circle.layer > 0) {
                        fctx1.clearRect(0, 0, wWidth, wHeight);
                        for (var i = 0, len = circles.length; i < len; i++) {
                            var item = circles[i],
                                x = item.x,
                                y = item.y,
                                radius = item.radius,
                                speed = item.speed;

                            if (x > wWidth + radius) {
                                x = -radius;
                            } else if (x < -radius) {
                                x = wWidth + radius
                            } else {
                                x += sin * speed;
                            }

                            if (y > wHeight + radius) {
                                y = -radius;
                            } else if (y < -radius) {
                                y = wHeight + radius;
                            } else {
                                y -= cos * speed;
                            }

                            item.x = x;
                            item.y = y;
                            drawCircle(x, y, radius, item.color, item.alpha);
                        }
                    }

                    if (config.line.amount > 0 && config.line.layer > 0) {
                        fctx2.clearRect(0, 0, wWidth, wHeight);
                        for (var j = 0, len = lines.length; j < len; j++) {
                            var item = lines[j],
                                x = item.x,
                                y = item.y,
                                width = item.width,
                                speed = item.speed;

                            if (x > wWidth + width * sin) {
                                x = -width * sin;
                            } else if (x < -width * sin) {
                                x = wWidth + width * sin;
                            } else {
                                x += sin * speed;
                            }

                            if (y > wHeight + width * cos) {
                                y = -width * cos;
                            } else if (y < -width * cos) {
                                y = wHeight + width * cos;
                            } else {
                                y -= cos * speed;
                            }

                            item.x = x;
                            item.y = y;
                            drawLine(x, y, width, item.color, item.alpha);
                        }
                    }

                    timer = requestAnimationFrame(animate);
                };

                var createItem = function () {
                    circles = [];
                    lines = [];

                    if (config.circle.amount > 0 && config.circle.layer > 0) {
                        for (var i = 0; i < config.circle.amount / config.circle.layer; i++) {
                            for (var j = 0; j < config.circle.layer; j++) {
                                circles.push({
                                    x: M.random() * wWidth,
                                    y: M.random() * wHeight,
                                    radius: M.random() * (20 + j * 5) + (20 + j * 5),
                                    color: config.circle.color,
                                    alpha: M.random() * 0.2 + (config.circle.alpha - j * 0.1),
                                    speed: config.speed * (1 + j * 0.5)
                                });
                            }
                        }
                    }

                    if (config.line.amount > 0 && config.line.layer > 0) {
                        for (var m = 0; m < config.line.amount / config.line.layer; m++) {
                            for (var n = 0; n < config.line.layer; n++) {
                                lines.push({
                                    x: M.random() * wWidth,
                                    y: M.random() * wHeight,
                                    width: M.random() * (20 + n * 5) + (20 + n * 5),
                                    color: config.line.color,
                                    alpha: M.random() * 0.2 + (config.line.alpha - n * 0.1),
                                    speed: config.speed * (1 + n * 0.5)
                                });
                            }
                        }
                    }

                    cancelAnimationFrame(timer);
                    timer = requestAnimationFrame(animate);
                    drawBack();
                };

                $(document).ready(function () {
                    setCanvasHeight();
                    createItem();
                });
                $(window).resize(function () {
                    setCanvasHeight();
                    createItem();
                });
            }
        })(jQuery)
    }
};
</script>

<style scoped>
    *{
        user-select: none;
    }
    #bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }

    #bg canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    #minil-logo{
        position: absolute;
        z-index: 999;
        left: 50%;
        transform: translate(-50%,0);
    }
    #minil-title{
        z-index: 999;
        position: absolute;
        top: 55%;
        left: 50%;
        transform: translate(-50%,0);
    }
.container{
    background: linear-gradient(to bottom right, rgb(26,46,112), rgb(20,20,40));
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
}
    ul{
        list-style: none;

    }
    .bubble{
        position: absolute;
        width: 100px;
        height: 100px;
        border-radius: 100%;
        background: #6495ed;
    }
    .bubble1{
        width: 600px;
        height: 600px;
        background: rgb(49, 89, 139);
        opacity: 0.5;
        left: 80%;
        top: -15%;
        animation: bubble1Ani 2s ease-in-out 1s infinite alternate;
    }
    @keyframes bubble1Ani{
        0%{
            top: -15%;
            background-color: #2fffac;
        }
        25%{
            top: -10%;
            background-color: #006680;
        }
        50%{
            top: -13%;
            background-color: #00e1ff;
        }
        75%{
            top: -17%;
            background-color: #007bff;
        }
        100%{
            top: -15%;
            background-color: #2fb6ff;
        }
    }
.bubble2{
    width: 300px;
    height: 300px;
    background: rgba(113, 87, 79, 0.8);
    left: 16%;
    top: 13%;
    animation: bubble2Ani 2s ease-in-out 1s infinite alternate;
}
    @keyframes bubble2Ani{
        0%{
            top: 11%;
            background-color: #7b817f;
        }
        25%{
            top: 14%;
            background-color: #815656;
        }
        50%{
            top: 10%;
            background-color: #ffa0d6;
        }
        75%{
            top: 13%;
            background-color: #b13ba6;
        }
        100%{
            top: 12%;
            background-color: #926f6f;
        }
    }
.bubble3{
    width: 400px;
    height: 400px;
    background: rgb(44, 29, 77);
    left: 60%;
    top: 40%;
    animation: bubble3Ani 2s ease-in-out 1s infinite alternate;
}
    @keyframes bubble3Ani{
        0%{
            top: 37%;
            background-color: #41264c;
        }
        25%{
            top: 41%;
            background-color: #b857ff;
        }
        50%{
            top: 38%;
            background-color: #ffa0d6;
        }
        75%{
            top: 39%;
            background-color: #b13ba6;
        }
        100%{
            top: 42%;
            background-color: #622769;
        }
    }
.bubble4{
    width: 500px;
    height: 500px;
    background: rgb(15, 52, 97);
    left: -5%;
    top: 70%;
    animation: bubble4Ani 2s ease-in-out 1s infinite alternate;
}
    @keyframes bubble4Ani{
        0%{
            top: 68%;
            background-color: #232d6b;
        }
        25%{
            top: 71%;
            background-color: #357ba7;
        }
        50%{
            top: 69%;
            background-color: #314486;
        }
        75%{
            top: 72%;
            background-color: #172270;
        }
        100%{
            top: 67%;
            background-color: #274c69;
        }
    }
.bubble5{
    width: 200px;
    height: 200px;
    background: rgb(100, 149, 237);
    left: 7%;
    animation: bubble5Ani 2s ease-in-out 1s infinite alternate;
}
    @keyframes bubble5Ani{
        0%{
            top: 1%;
            background-color: #5e72ee;
        }
        25%{
            top: -1%;
            background-color: #357ba7;
        }
        50%{
            top: 2%;
            background-color: #314486;
        }
        75%{
            top: 0%;
            background-color: #3b426e;
        }
        100%{
            top: 1%;
            background-color: #6dacde;
        }
    }
    .jump-button{
        position: absolute;
        z-index: 999;
        width: 300px;
        height: 80px;
        border: solid cornflowerblue 1.5px;
        border-radius: 40px;
        left: 50%;
        top: 55%;
        transform: translate(-50%, 0);
        margin-top: 150px;
        text-align: center;
        transition: all 0.2s ease-in-out;
        color: white;
        font-family: "Microsoft YaHei UI Light" ,sans-serif;
        font-size: 25px;
    }
    .button-text{
        padding-top: 20px;
        letter-spacing: 2px;
    }
    .jump-button:hover{
        background: cornflowerblue;
        border: solid #397cf5 1.5px;
        transform: translate(-50%, -5px);
        color: black;
    }
</style>
