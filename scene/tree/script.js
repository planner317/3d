import * as THREE from "../../viewer/jsm/three.module.js";
import { MTLLoader } from "../../viewer/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "../../viewer/jsm/loaders/OBJLoader.js";
import Viewer from "../../viewer/viewer.js";

let viewer = new Viewer();
window.viewer = viewer
viewer.setCubemap("skybox/",0,".jpeg")


let  preload, percentComplete

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
                viewer.model = object
                object.traverse((e) => {
                    if (e.material)
                        if (e.material.name) {
                            if (e.material.name.slice(0, 4) == "alfa") {
                                e.material.alphaTest = 0.5;
                                e.material.premultipliedAlpha= true
                                e.material.side = 2
                                
                            }
                        }
                })
                if (document.readyState != "complete") {
                    window.addEventListener("load", start)
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
    viewer.ambientLight.visible = true;
    viewer.lightCamera.visible = false
    viewer.deleteAllMesh();
    viewer.ambientLight.intensity = 0.5;
    viewer.renderer.toneMappingExposure=1.5
    //viewer.scene.remove(viewer.sunLight);
    viewer.sunLight.visible = true
    viewer.sunLight.intensity = 1.5
    viewer.camera.position.set(0, 5, 0);
    viewer.scene.add(viewer.model)
    viewer.ArreyCollisionMesh = []

    let clone1 = viewer.model.clone()
    clone1.position.z=-117
    viewer.scene.add(clone1)


    
    // setInterval(()=>{

    //     viewer.model.traverse((e) => {
    //         if (e.material)
    //         if (e.material.name) {
    //             if (e.material.name.slice(0, 4) == "alfa") {
    //                 e.material.needsUpdate=true
                    
    //             }
    //         }
    //     })
    // },200)
}