let sound = [
    "Turel Clan",
    "Underworld",
    "Cathedral cmb",
    "Drownedabbey",
    "Kain encounter",
    "Necropolis cmb",
    "Ruinedcity cmb",
    "Ruinedcity",
    "Sunlightglyph sus",
]
let numSound = Math.floor(Math.random() * sound.length)





/// кнопка музыки
let button = document.createElement("div")
document.body.append(button)
button.onclick = (e) => {
    e.stopPropagation()
    if (button.innerHTML == "X" ){
        button.innerHTML = "🔈"
        conteiner.style.display = "none"
    }
    else {
        button.innerHTML = "X"
        conteiner.style.display = "block"
    }
}
button.classList.add("buttonSound")
button.innerHTML = "🔈"

let conteiner = document.createElement("div")
conteiner.classList.add("fix")
conteiner.style.display = "none"
document.body.append(conteiner)
conteiner.onclick = (e) => e.stopPropagation()

let player = new Audio("media/" + sound[numSound] + ".mp3")
player.controls = true;
player.volume = 0.3
conteiner.append(player)

// плейлист
let playList = document.createElement("div")
playList.classList.add("fix")
conteiner.append(playList)

player.onended = () => {
    numSound++
    if (numSound >= sound.length) numSound = 0
    player.src = "media/" + sound[numSound] + ".mp3"
    playList.childNodes.forEach((dom) => {
        dom.classList.remove("select")
    })
    playList.childNodes[numSound].classList.add("select")
    player.play()
}

sound.forEach((e, i) => {
    let track = document.createElement("div")
    track.className = "track"
    track.innerHTML = e;
    playList.append(track)
    track.onclick = (event) => {
        player.src = "media/" + e + ".mp3";
        player.play();
        numSound = i
        playList.childNodes.forEach((dom) => {
            dom.classList.remove("select")
        })
        event.currentTarget.classList.add("select")
    }

})
