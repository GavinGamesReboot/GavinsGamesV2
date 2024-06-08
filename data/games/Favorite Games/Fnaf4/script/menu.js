let animations = {
    "bedroom/bedroom-front-back-go-": 16,
    "bedroom/bedroom-front-closet-": 4,
    "bedroom/bedroom-front-closet-foxy-": 4,
    "bedroom/bedroom-front-left-": 4,
    "bedroom/bedroom-front-left-go-": 5,
    "bedroom/bedroom-front-right-": 4,
    "bedroom/bedroom-front-right-go-": 5,
    "left-door/door-left-close-": 10,
    "left-door/door-left-close-bonnie-go-": 9,
    "left-door/door-left-close-foxy-go-": 6,
    "left-door/door-left-enter-": 18,
    "right-door/door-right-close-chica-go-": 13,
    "right-door/door-right-close-foxy-go-": 6,
    "right-door/right-door-close-": 11,
    "right-door/right-door-go-": 15,
    "running/running-": 30,
    "bed/bed-freddle-1-": 12,
    "bed/bed-freddle-2-": 10,
    "bed/bed-freddle-3-": 8,
    "bed/bed-from-room-": 10,
    "closet/closet-close-": 5,
    "closet/closet-go-": 13,
    "closet/closet-light-foxy-": 3,
    "jumpscares/bonnie-bedroom/bonnie-bedroom-": 17,
    "jumpscares/bonnie-door/bonnie-door-": 18,
    "jumpscares/chica-bedroom/chica-bedroom-": 13,
    "jumpscares/chica-door/chica-door-": 16,
    "jumpscares/foxy/foxy-": 19,
    "jumpscares/freddy-bed/freddy-bed-": 19,
    "jumpscares/freddy-bedroom/freedy-bedroom-": 15,
}

let staticframes = [
    "bed/bed",
    "bed/bed-no-light", 
    "tutorials/tutorial-closet", 
    "tutorials/tutorial-bed", 
    "tutorials/tutorial-left-door", 
    "tutorials/tutorial-left", 
    "tutorials/tutorial-right-door", 
    "tutorials/tutorial-right", 
    "left-door/door-left-light-no",
    "right-door/right-door-light-no",
]

function preloadStaticFrames () {
    for (let index = 0; index < staticframes.length; ++index) {
        console.log("/fnafweb/images/" + staticframes[index] + ".png")
        var img=new Image();
        img.src="/fnafweb/images/" + staticframes[index] + ".png";
    }
}

preloadStaticFrames()

function preloadAllImages () {
    for (var animation in animations) {
        if (animations.hasOwnProperty(animation)) {
            for (let i = 1; i <= animations[animation]; i++) {
                console.log("/fnafweb/images/" + animation + i + ".png")
                var img=new Image();
                img.src="/fnafweb/images/" + animation + i + ".png";
            }
        }
    }
}

preloadAllImages()

const fadeOut = [
    {opacity: "100%"},
    {opacity: "100%"},
    {opacity: "0%"}
]

const fadeIn = [
    {opacity: "0%"},
    {opacity: "100%"},
    {opacity: "100%"}
]

const fadeInOut = [
    { opacity: "0%" },
    { opacity: "100%" },
    { opacity: "100%" },
    { opacity: "0%" },
];

const blackoutJumpscare = [
    { opacity: "0%" },
    { opacity: "100%" },
    { opacity: "50%" },
    { opacity: "100%" },
    { opacity: "0%" },
    { opacity: "80%" },
    { opacity: "50%" },
    { opacity: "100%" },
    { opacity: "100%" },
    { opacity: "100%" },
    { opacity: "100%" },
];

const fadeTiming = {
    duration: 4000,
    iterations: 1,
    fill: "forwards"
};

const fadeTimingFast = {
    duration: 2000,
    iterations: 1,
    fill: "forwards"
};

const fadeReallyFastTiming = {
    duration: 700,
    iterations: 1,
    fill: "forwards"
};

const menuDiv = document.getElementById("menu-div")
const disclaimerDiv = document.getElementById("disclaimer")
const blackScreenDiv = document.getElementById("black-screen")
const gameDiv = document.getElementById("game")
const blackScreenGameDiv = document.getElementById("black-screen-game")
const disclaimerAnim = disclaimerDiv.animate(
    fadeInOut, fadeTiming
)



disclaimerAnim.onfinish = () => {
    disclaimerDiv.style.display = "none"
    PlaySound(menuMus)
    let blackScreenAnim = blackScreenDiv.animate(
        fadeOut, fadeTiming
    )
    blackScreenAnim.onfinish = () => {
        blackScreenDiv.style.display = "none"
    }
}

// FNAF 4 Logo

const logoFNAF = document.getElementById("logo")
const logoFNAFFrameIndexes = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 4]

setInterval(animate, 50); 
var x = 1; 
  
function animate() { 
    if (logoFNAFFrameIndexes.length == x) { 
        x = 1; 
    } 
    logoFNAF.src = "/fnafweb/images/misc/logo" + logoFNAFFrameIndexes[x] + ".png" 
    x++; 
} 

function startGame() {
    blackScreenDiv.style.display = "block"
    const blackScreenFadeIn = blackScreenDiv.animate(
        fadeIn, fadeTiming
    )
    blackScreenFadeIn.onfinish = () => {
        menuDiv.style.display = "none"
        gameDiv.style.display = "block"
        menuMus.pause()
        PlaySound(ambienceMus)
        const blackScreenGameAnim = blackScreenGameDiv.animate(
            fadeOut, fadeTimingFast
        )
        blackScreenGameAnim.onfinish = () => {
            blackScreenGameDiv.style.display = "none"
            startAllAI()
        }
    }
}
