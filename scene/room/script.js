import * as THREE from "../../viewer/jsm/three.module.js";
import { MTLLoader } from "../../viewer/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "../../viewer/jsm/loaders/OBJLoader.js";
import Viewer from "../../viewer/viewer.js";

window.viewer = new Viewer();

let mirrorRoom, room, visible, nightflag, preload, percentComplete, offon, ghost, ligtScreen


var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 90;
        viewer.createText(`${Math.round(percentComplete)}%`);
    }
};

var onError = function () { };

var manager = new THREE.LoadingManager();

///////////////////////
new MTLLoader(manager)
    .setPath('model/')
    .load('room.mtl', function (materials) { // callback функция вызывается после загрузки

        materials.preload();

        new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('model/')
            .load('room.obj', function (object) {
                room = object
                if (document.readyState != "complete") {
                    window.onload = start;
                    preload = setInterval(() => {
                        if (percentComplete < 99) percentComplete++
                        else clearInterval(preload);
                        viewer.createText(percentComplete + "%")
                    }, 1000)
                }
                else setTimeout(start, 1000)
            }, onProgress, onError);
    });

function start() {
    load.remove()
    clearInterval(preload);
    viewer.ambientLight.visible = true;
    viewer.lightCamera.visible = false
    viewer.deleteAllMesh();
    viewer.ambientLight.intensity = 1;
    viewer.scene.remove(viewer.sunLight);
    viewer.scene.background = 0;
    viewer.camera.position.set(0, 25, 0);

    //////////////////////// свет от мониторов ////////////
    ligtScreen = new THREE.SpotLight()
    ligtScreen.penumbra = 0.1
    ligtScreen.distance = 130
    ligtScreen.position.set(45, 20, -20)
    ligtScreen.target.position.set(-50, 30, -17)

    ligtScreen.intensity = 0.3
    viewer.scene.add(ligtScreen)
    viewer.scene.add(ligtScreen.target)

    room.getObjectByName("collizian").material.visible = false
    room.getObjectByName("offon").material.visible = false

    room.add(ligtScreen)
    mirrorRoom = room.clone();
    mirrorRoom.scale.x = -1
    mirrorRoom.position.x = -105.4
    viewer.scene.add(room)
    viewer.scene.add(mirrorRoom)
    mirrorRoom.getObjectByName("ghost").visible = false

    offon = mirrorRoom.getObjectByName("offon")
    ghost = room.getObjectByName("ghost")

    visible = [
        room.getObjectByName("ssss"),
        mirrorRoom.getObjectByName("ssss"),
        room.getObjectByName("windowDark"),
        mirrorRoom.getObjectByName("windowDark"),
        ghost, ligtScreen, mirrorRoom.children[15]
    ];
    let texture = new THREE.VideoTexture(video);
    visible[0].material.emissiveMap = texture;
    visible[1].material.emissiveMap = texture;

    let texture2 = new THREE.VideoTexture(video2);
    ghost.material[0].emissiveMap = texture2;

    visible.forEach((e) => {
        e.visible = false
    })

    viewer.ArreyCollisionMesh = [room.children[0], mirrorRoom.children[0], room.getObjectByName("offon"), offon];
    animate()
}
function animate() {
    event()
    if (nightflag) lightAnimate()

    requestAnimationFrame(animate);
}
function lightAnimate() {
    //////////////////////// анимация света от экрана
    if (video.currentTime > 0.0 && video.currentTime < 1.2) intensityScreen(0.3)
    if (video.currentTime > 1.2 && video.currentTime < 1.5) intensityScreen(0.1)
    if (video.currentTime > 1.5 && video.currentTime < 6.1) intensityScreen(0.3)
    if (video.currentTime > 6.1 && video.currentTime < 8.7) intensityScreen(0.5)
    if (video.currentTime > 8.7 && video.currentTime < 14.3) intensityScreen(0.4)
    if (video.currentTime > 14.3 && video.currentTime < 18.7) intensityScreen(0.6)
    if (video.currentTime > 18.7 && video.currentTime < 21.7) intensityScreen(0.2)
    if (video.currentTime > 21.7 && video.currentTime < 33.5) intensityScreen(0.4)
    if (video.currentTime > 33.5 && video.currentTime < 35.0) intensityScreen(0.2)
    if (video.currentTime > 35.0 && video.currentTime < 35.5) intensityScreen(0.3)
    if (video.currentTime > 35.5 && video.currentTime < 37.0) intensityScreen(0.1)
    if (video.currentTime > 37.0 && video.currentTime < 52.6) intensityScreen(0.4)
    if (video.currentTime > 52.6 && video.currentTime < 58.0) intensityScreen(0.2)
    if (video.currentTime > 58.0 && video.currentTime < 59.3) intensityScreen(0.4)
    if (video.currentTime > 59.3 && video.currentTime < 64.0) intensityScreen(0.1)
    if (video.currentTime > 64.0 && video.currentTime < 68.8) intensityScreen(0.5)
    if (video.currentTime > 68.8 && video.currentTime < 69.8) intensityScreen(0.1)
    if (video.currentTime > 69.8 && video.currentTime < 73.2) intensityScreen(0.4)
    if (video.currentTime > 73.2 && video.currentTime < 82.5) intensityScreen(0.3)
    if (video.currentTime > 82.5) intensityScreen(0.1)
}
//////////////тормаз////
function event() {
    if (viewer.rayDirectionMove) {    // если по направлению движения есть объект (только при движении камеры)
        ////////////// выключатель в зеркале
        if (viewer.rayDirectionMove.distance < 5 && viewer.rayDirectionMove.object == offon) {
            night()
        }
        ////////////// призрак скример и вырубить
        if (viewer.camera.position.distanceTo(ghost.position) < 30 && nightflag) {
            day()
        }
    }
}

function night() {
    if (!nightflag) {

        visible.forEach((e) => {
            e.visible = true
        })
        viewer.ambientLight.intensity = 0.05
        nightflag = 1
        video.play();
        video2.play();
    }
}

let pOld
function intensityScreen(p) {
    if (p != pOld) {
        ligtScreen.intensity = p
        mirrorRoom.children[15].intensity = p
        pOld = p
    }
}

function day() {
    nightflag = 0;
    video.pause()
    video2.pause()
    screamer.currentTime = 0;
    screamer.style.display = "block"
    screamer.play();
    screamer.onended = () => {
        screamer.style.display = "none";
        screamer.currentTime = 0;
        viewer.ambientLight.intensity = 1;
        visible.forEach((e) => {
            e.visible = false
        })
    }
}
