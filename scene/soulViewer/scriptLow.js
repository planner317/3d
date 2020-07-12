import * as THREE from "../../viewer/jsm/three.module.js";
import { FBXLoader } from "../../viewer/jsm/loaders/FBXLoader.js"
import Viewer from "../../viewer/viewer.js";
import LoadModel from "./loadModel.js";
import { gui, GUI, color } from "../../viewer/jsm/libs/dat.gui.module.js";


let viewer = new Viewer();
window.viewer = viewer


let minVec = new THREE.Vector3(-666, 10, -940)
let maxVec = new THREE.Vector3(666, 666, 533)

let percentComplete

var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 99;
        load.innerHTML = `загрузка ${Math.round(percentComplete)}%`
    }
};

var onError = function () { };

var manager = new THREE.LoadingManager();
manager.onLoad = ()=>{      // после загрузки всех текстур
    load.innerHTML = ""
}
manager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {    // менеджер текстур что в файле fbx
    load.innerHTML = "подгружаются текстуры " + itemsLoaded + "/" + itemsTotal + " " + urlOfLastItemLoaded
  };

new FBXLoader(manager)
    .setPath('model/vorodorRuin/')
    .load('vorodorRuinLow.fbx', function (object) {
        viewer.deleteAllMesh();
        //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        object.traverse((c) => {
            if (c.material) {
                if (c.material.length) {
                    c.material.forEach(mat => mapToEmessive(mat))
                }
                else mapToEmessive(c.material)
            }
        })
        window.vorodorRuin = object
        setTimeout(start, 100)
    }, onProgress, onError);

function mapToEmessive(mat) {
    mat.color.setHex(0);
    mat.emissive.setHex(0xffffff);
    mat.emissiveIntensity = 1
    if (mat.map === null) return
    if (mat.emissiveMap === null) {
        mat.emissiveMap = mat.map;
    }
}
//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

function start() {
    new LoadModel(viewer.scene);
    load.innerHTML = ""

    window.addEventListener("keypress", playSound)
    window.addEventListener("touchstart", playSound)
    function playSound() {
        player.play()
        if (!player.paused){
            window.removeEventListener("keypress",playSound)
            window.removeEventListener("touchstart",playSound)
        }
        playList.childNodes.forEach((dom) => {
            dom.classList.remove("select")
        })
        playList.childNodes[numSound].classList.add("select")
    }

    viewer.renderer.toneMappingExposure = 1
    viewer.renderer.outputEncoding = 3001

    viewer.ambientLight.visible = true;
    viewer.ambientLight.intensity = 1
    viewer.ambientLight.color.setHex(0xf0f0ff)

    // viewer.scene.background = new THREE.Color(0x445566);
    // viewer.scene.fog = new THREE.Fog(0x606070, -800, 3000);

    viewer.camera.far = 200000
    viewer.camera.position.set(0, 50, 85);
    viewer.camera.updateProjectionMatrix()

    viewer.lightCamera.visible = false
    viewer.keyBordMouseControl.speed = 2
    viewer.touchControl.speedPosition = 3

    let ruinShadow = vorodorRuin.getObjectByName("ruinShadow")
    ruinShadow.material.forEach((m) => {
        m.transparent = true
        m.blending = 4
        if (m.name == "matStatuetShadow") window.matStatuetShadow = m.emissiveMap
    })

    let ruin = vorodorRuin.getObjectByName("ruin")
    ruin.material[3].emissiveIntensity=0.4

    let statuet = vorodorRuin.getObjectByName("statuet")

    statuet.material.forEach(e => {
        e.lightMap = matStatuetShadow
        e.color.setScalar(0.01)
        e.lightMapIntensity = 100
        e.emissiveIntensity = 0.01
    });

    let mirrorStatuet = statuet.clone()
    mirrorStatuet.scale.z = -1
    mirrorStatuet.rotation.set(0, 0, 0)
    mirrorStatuet.position.set(0, 0, 0)
    statuet.add(mirrorStatuet)

    let sky = vorodorRuin.getObjectByName("sky")
    sky.material.fog = false

    viewer.scene.add(vorodorRuin)

    let mirror = vorodorRuin.clone()
    mirror.scale.set(-1, 1, 1);
    mirror.remove(mirror.getObjectByName("sky"))

    viewer.scene.dispose()
    viewer.userFunc = () => {
        viewer.camera.position.clamp(minVec, maxVec)
        sky.material.emissiveMap.offset.x -= 0.0002
    }
    viewer.ArreyCollisionMesh = [statuet, ruinShadow, mirror.getObjectByName("statuet"), mirror.getObjectByName("ruinShadow")]

    viewer.scene.add(mirror)

}
