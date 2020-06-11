import * as THREE from "../../viewer/jsm/three.module.js";
import { MTLLoader } from "../../viewer/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "../../viewer/jsm/loaders/OBJLoader.js";
import Viewer from "../../viewer/viewer.js";

let viewer = new Viewer();
window.viewer = viewer

let model, preload, percentComplete

var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 90;
        viewer.createText(`${Math.round(percentComplete)}%`);
    }
};

var onError = function () { };

var manager = new THREE.LoadingManager();

new MTLLoader(manager)
    .setPath('model/')
    .load('model.mtl', function (materials) { // callback функция вызывается после загрузки

        materials.preload();

        new OBJLoader(manager)
            .setMaterials(materials)
            .setPath('model/')
            .load('model.obj', function (object) {
                model = object
                if (document.readyState != "complete") {
                    window.addEventListener("load", start)
                    preload = setInterval(() => {
                        if (percentComplete < 99) percentComplete++
                        else clearInterval(preload);
                        viewer.createText(percentComplete + "%")
                    }, 1000)
                }
                else setTimeout( start,1000)
            }, onProgress, onError);
    });

function start() {
    load.remove()
    clearInterval(preload);
    viewer.ambientLight.visible = true;
    viewer.lightCamera.visible = false
    viewer.deleteAllMesh();
    viewer.ambientLight.intensity = 1.7;
    viewer.scene.remove(viewer.sunLight);
    viewer.scene.background=0;
    viewer.camera.position.set(0, 25, 0);
    viewer.scene.add(model)
    viewer.ArreyCollisionMesh=model.children
}