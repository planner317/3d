import * as THREE from "../../viewer/jsm/three.module.js";
import { FBXLoader } from "../../viewer/jsm/loaders/FBXLoader.js"
import { GUI } from '../../viewer/jsm/libs/dat.gui.module.js';

import Viewer from "../../viewer/viewer.js";

let viewer = new Viewer();
window.viewer = viewer

var clock = new THREE.Clock();

let animations = [
    "idle (4)",
    "idle (3)",
    "idle (2)",
    "idle",
    "slash (2)",
    "slash (3)",
    "slash (4)",
    "slash (5)",
    "slash",
    "attack (2)",
    "attack (3)",
    "attack (4)",
    "attack",
    "run (2)",
    "run",
    "block (2)",
    "block idle",
    "block",
    "casting (2)",
    "casting",
    "crouch block (2)",
    "crouch block idle",
    "crouch block",
    "crouch idle",
    "crouch",
    "crouching (2)",
    "crouching (3)",
    "crouching",
    "death (2)",
    "death",
    "impact (2)",
    "impact (3)",
    "impact",
    "jump (2)",
    "jump",
    "kick",
    "power up",
    "strafe (2)",
    "strafe (3)",
    "strafe (4)",
    "strafe",
    "turn (2)",
    "turn",
    "walk (2)",
    "walk",
    "180 turn (2)",
    "180 turn",
]
let dance = [
    "Slide Hip Hop Dance",
    "Wave Hip Hop Dance",
    "Breakdance Freezes (1)",
    "Gangnam Style (1)",
    "Swing Dancing",
    "Robot Hip Hop Dance",
    "Hip Hop Dancing",
    "Shuffling",
]

var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 100;
        load.innerHTML = `${Math.round(percentComplete)}%`
    }
};

var onError = function () { };

var manager = new THREE.LoadingManager();

new FBXLoader(manager)
    .setPath('model/kain/')
    .load('kain.fbx', function (object) {
        viewer.deleteAllMesh();

        window.kain = object
        window.kainSword = kain.getObjectByProperty("name", "kain_sword")
        window.kainRightHand = kain.getObjectByProperty("name", "mixamorigRightHand")

        viewer.scene.add(object)

        new FBXLoader(manager)
            .setPath('model/raziel/')
            .load('raziel1.fbx', function (object) {

                window.raziel = object

                let SkinnedMesh = raziel.getObjectByProperty("type", "SkinnedMesh")
                SkinnedMesh.material[3].side = 2 // крылья 2 стороны
                SkinnedMesh.material[3].alphaTest = 0.5
                SkinnedMesh.material[0].specular.setRGB(2, 2, 2)
                let root = raziel.getObjectByProperty("type", "Group")
                root.position.x = 100


                viewer.scene.add(object)
                start()
            });
    });


let param = {}

function start() {

    window.gui = new GUI();
    gui.domElement.onclick = (e) => e.stopPropagation()
    gui.domElement.style.opacity = 0.8
    let folder = gui.addFolder('Animations');
    for (let i = 0; i < animations.length; i++) {
        let name = animations[i]

        param[name] = function (e) {
            kainSword.visible = true
            animationRig(name)
        }
        folder.add(param, name)
    }
    folder.open()

    let danceFolder = folder.addFolder('Dance');
    for (let i = 0; i < dance.length; i++) {
        let name = dance[i]

        param[name] = function (e) {
            kainSword.visible = false
            animationRig(name)
        }
        danceFolder.add(param, name)
    }
    danceFolder.open()

    load.remove()
    viewer.ambientLight.visible = true;
    viewer.ambientLight.intensity = 0.1;

    viewer.lightCamera.layers.disable(0)
    viewer.renderer.shadowMap.enabled = true;
    viewer.renderer.outputEncoding = THREE.sRGBEncoding;

    kain.children[1].castShadow = true;
    kain.children[1].receiveShadow = true


    viewer.sunLight.visible = true
    viewer.sunLight.intensity = 2

    viewer.sunLight.shadow.mapSize.width = 1024;
    viewer.sunLight.shadow.mapSize.height = 1024;
    viewer.sunLight.shadow.radius = 2
    viewer.sunLight.shadow.camera.top = 200;
    viewer.sunLight.shadow.camera.bottom = - 200;
    viewer.sunLight.shadow.camera.left = - 200;
    viewer.sunLight.shadow.camera.right = 200;
    viewer.sunLight.shadow.camera.near = 1;
    viewer.sunLight.shadow.camera.far = 500;
    viewer.sunLight.castShadow = true;  // отбрасывать тень


    //viewer.scene.background = 0;
    viewer.camera.position.set(-53, 46, 114);
    viewer.camera.rotation.set(0, -0.46, 0.02)

    viewer.scene.traverse((e) => {

        if (e.isMesh) {
            e.castShadow = true
            e.receiveShadow = true
        }
    });

    window.mixerRaizel = new THREE.AnimationMixer(raziel);
    window.actionRaziel = mixerRaizel.clipAction(raziel.animations[0]);
    animationRig("idle (4)", "raziel")


    window.mixerKain = new THREE.AnimationMixer(kain);
    window.actionKain = mixerKain.clipAction(kain.animations[0]);
    animationRig("idle (3)", "kain")

    viewer.floor.receiveShadow = true;  // принимает тень
    viewer.scene.add(viewer.floor)

    animate()

}

function animate() {
    var delta = clock.getDelta();

    if (mixerKain) mixerKain.update(delta);
    if (mixerRaizel) mixerRaizel.update(delta);

    requestAnimationFrame(animate);
}
function animationRig(file, mode = "kainAndRaziel") {
    new FBXLoader(manager)
        .setPath('model/kain/animate/')
        .load(`${file}.fbx`, function (object) {
            if (mode == "kainAndRaziel" || mode == "kain") {
                actionKain.stop()
                actionKain = mixerKain.clipAction(object.animations[0]);
                actionKain.play();
            }

            if (mode == "kainAndRaziel" || mode == "raziel") {
                actionRaziel.stop()
                actionRaziel = mixerRaizel.clipAction(object.animations[0]);
                actionRaziel.play();
            }
        });
}

