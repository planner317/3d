import * as THREE from "../../viewer/jsm/three.module.js";
import { FBXLoader } from "../../viewer/jsm/loaders/FBXLoader.js"
import { GUI } from '../../viewer/jsm/libs/dat.gui.module.js';

import Viewer from "../../viewer/viewer.js";

let viewer = new Viewer();
window.viewer = viewer

var clock = new THREE.Clock();
let param ={
    "dance1" : dance1,
    "dance2" : dance2,
    "pause" : dance2,
}

var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 100;
        load.innerHtml(`${Math.round(percentComplete)}%`);
    }
};

var onError = function () { };

var manager = new THREE.LoadingManager();

new FBXLoader(manager)
    .setPath('model/raziel/')
    .load('raziel.fbx', function (object) { // callback функция вызывается после загрузки
        viewer.deleteAllMesh();

        window.raziel = object
        raziel.children[0].castShadow = true; 
        raziel.children[0].material[3].side =2 // крылья 2 стороны
        raziel.children[0].material[3].alphaTest=0.5

        window.mixer = new THREE.AnimationMixer(object);

        window.action = mixer.clipAction(object.animations[0]);

        action.play();
        viewer.scene.add(object)
        start()
    });

function start() {
    window.gui = new GUI();
    gui.add( param, "dance1")
    gui.add( param, "dance2")

    load.remove()
    viewer.ambientLight.visible = true;
    viewer.ambientLight.intensity = 0.0;

    viewer.renderer.shadowMap.enabled = true;
    viewer.sunLight.visible = true
    viewer.sunLight.intensity = 1
    viewer.sunLight.shadow.camera.top = 200;
    viewer.sunLight.shadow.camera.bottom = - 200;
    viewer.sunLight.shadow.camera.left = - 200;
    viewer.sunLight.shadow.camera.right = 200;
    viewer.sunLight.shadow.camera.near = 1;
    viewer.sunLight.shadow.camera.far = 500;
    viewer.sunLight.castShadow = true;  // отбрасывать тень
    
    viewer.floor.receiveShadow = true;  // принимает тень
    viewer.scene.add(viewer.floor)

    //viewer.scene.background = 0;
    viewer.camera.position.set(5, 115, 400);
    animate()

}
function animate() {
    var delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    requestAnimationFrame( animate );
}
function dance1(){
    action.stop()
    action = mixer.clipAction(raziel.animations[0]);
    action.play()
}
function dance2(){
    action.stop()
    action = mixer.clipAction(raziel.animations[1]);
    action.play()
}