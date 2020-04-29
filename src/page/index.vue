<template>
    <div class="container">
        <div class="noise"></div>
        <div class="overlay"></div>
        <div class="terminal">
            <h1>
                MiniLCTF
                <span class="errorcode">2020</span> Terminal
            </h1>
            <p contenteditable="true" class="output">cat ~/index</p>
            <p contenteditable="true" class="output">Hey! Hackers.</p>
            <p
                contenteditable="true"
                class="output"
            >I've heard that you are tech lovers, software crackers or someone like geeks. But I think you guys are not strong enough <3.</p>
            <p
                contenteditable="true"
                class="output"
            >If you want to prove to me how pro you are, i've prepared some challenges for you guys.</p>
            <p class="output">
                Please try to
                <a href="/login">click me</a>.
            </p>
            <p class="output">Good luck and have fun <3</p>
            <p class="output">hostname</p>
            <p class="output">XDSEC</p>
        </div>
    </div>
</template>

<script>
export default {
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
    }
};
</script>

<style scoped>
html {
    min-height: 100%;
}
.container {
    box-sizing: border-box;
    height: 100%;
    background-color: #000000;
    background-image: radial-gradient(#11581e, #041607);
    background-repeat: no-repeat;
    background-size: cover;
    font-family: Consolas, Helvetica, sans-serif;
    font-size: 1.5rem;
    color: rgba(128, 255, 128, 0.8);
    text-shadow: 0 0 1ex #33ff33, 0 0 2px rgba(255, 255, 255, 0.8);
    text-align: center;
}

.noise {
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    /* background-image: url("../../static/images/giphy.gif"); */
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
    opacity: 0.02;
}

.overlay {
    pointer-events: none;
    position: absolute;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
        180deg,
        rgba(0, 0, 0, 0) 0,
        rgba(0, 0, 0, 0.3) 50%,
        rgba(0, 0, 0, 0) 100%
    );
    background-size: auto 4px;
    z-index: 1;
}

.overlay::before {
    content: "";
    pointer-events: none;
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-image: -webkit-gradient(
        linear,
        left bottom,
        left top,
        from(transparent),
        color-stop(2%, rgba(32, 128, 32, 0.2)),
        color-stop(3%, rgba(32, 128, 32, 0.8)),
        color-stop(3%, rgba(32, 128, 32, 0.2)),
        to(transparent)
    );
    background-image: linear-gradient(
        0deg,
        transparent 0%,
        rgba(32, 128, 32, 0.2) 2%,
        rgba(32, 128, 32, 0.8) 3%,
        rgba(32, 128, 32, 0.2) 3%,
        transparent 100%
    );
    background-repeat: no-repeat;
    -webkit-animation: scan 7.5s linear 0s infinite;
    animation: scan 7.5s linear 0s infinite;
}

@-webkit-keyframes scan {
    0% {
        background-position: 0 -100vh;
    }
    35%,
    100% {
        background-position: 0 100vh;
    }
}

@keyframes scan {
    0% {
        background-position: 0 -100vh;
    }
    35%,
    100% {
        background-position: 0 100vh;
    }
}
.terminal {
    box-sizing: inherit;
    position: relative;
    height: 100%;
    width: 1000px;
    max-width: 100%;
    padding: 4rem;
    text-transform: uppercase;
    margin: 0 auto;
    text-align: left;
}

.output {
    color: rgba(128, 255, 128, 0.8);
    text-shadow: 0 0 1px rgba(51, 255, 51, 0.4),
        0 0 2px rgba(255, 255, 255, 0.8);
    outline: none;
}

.output::before {
    content: "> ";
}

/*
.input {
  color: rgba(192, 255, 192, 0.8);
  text-shadow:
      0 0 1px rgba(51, 255, 51, 0.4),
      0 0 2px rgba(255, 255, 255, 0.8);
}

.input::before {
  content: "$ ";
}
*/
a {
    color: #fff;
    text-decoration: none;
}

a::before {
    content: "[";
}

a::after {
    content: "]";
}

.errorcode {
    color: white;
}
</style>
