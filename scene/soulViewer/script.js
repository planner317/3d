import * as THREE from "../../viewer/jsm/three.module.js";
import { FBXLoader } from "../../viewer/jsm/loaders/FBXLoader.js"
import Viewer from "../../viewer/viewer.js";
import LoadModel from "./loadModel.js";
import { gui, GUI } from "../../viewer/jsm/libs/dat.gui.module.js";

let viewer = new Viewer();
window.viewer = viewer
let loadModel = new LoadModel(viewer.scene);

let minVec = new THREE.Vector3(-666, 10, -940)
let maxVec = new THREE.Vector3(666, 666, 533)


let percentComplete
let clock = new THREE.Clock();


var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 99;
        load.innerHTML = `загрузка ${Math.round(percentComplete)}%`
    }
};

var onError = function () { };

var manager = new THREE.LoadingManager();


new FBXLoader(manager)
    .setPath('model/vorodorRuin/')
    .load('vorodorRuin.fbx', function (object) {
        viewer.deleteAllMesh();
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

function start() {
    load.innerHTML = ""
    window.addEventListener("click", playSound)
    function playSound() {
        soundRain.play()
        soundRain.volume = 0.3
        soundMusic.play()
        soundMusic.volume = 0.3
        if (!soundMusic.paused) window.removeEventListener("click", playSound)
    }
    viewer.renderer.toneMappingExposure = 1
    viewer.renderer.outputEncoding = 3001
    viewer.renderer.shadowMap.enabled = true;
    viewer.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

    viewer.ambientLight.visible = true;
    viewer.ambientLight.intensity = 0.05;
    viewer.ambientLight.color.setHex(0xf0f0ff)

    viewer.scene.background = new THREE.Color(0x112233);
    viewer.scene.fog = new THREE.Fog(0x223344, 0, 3000);

    viewer.camera.far = 200000
    viewer.camera.position.set(0, 50, 85);
    viewer.camera.updateProjectionMatrix()

    viewer.lightCamera.visible = false
    viewer.keyBordMouseControl.speed = 2
    viewer.touchControl.speedPosition = 3

    viewer.sunLight.visible = true
    viewer.sunLight.intensity = 1

    viewer.sunLight.position.set(0, 240, 300)
    viewer.sunLight.shadow.mapSize.width = 2048;
    viewer.sunLight.shadow.mapSize.height = 2048;
    viewer.sunLight.shadow.radius = 1
    viewer.sunLight.shadow.camera.top = 120;
    viewer.sunLight.shadow.camera.bottom = - 250;
    viewer.sunLight.shadow.camera.left = - 75;
    viewer.sunLight.shadow.camera.right = 75;
    viewer.sunLight.shadow.camera.near = 1;
    viewer.sunLight.shadow.camera.far = 800;
    viewer.sunLight.castShadow = true;  // отбрасывать тень

    window.planeShadow = new THREE.Mesh(new THREE.PlaneGeometry(200, 400), new THREE.ShadowMaterial({ depthWrite: false, opacity: 0.6 }))
    planeShadow.rotateX(-Math.PI / 2)
    planeShadow.position.y = 0.5
    planeShadow.receiveShadow = true
    viewer.scene.add(planeShadow)


    let ruin = vorodorRuin.getObjectByName("ruin")

    ruin.material.forEach(e => {
        if (e.name.slice(0, 4) == "alfa") e.alphaTest = 0.5
        if (e.name == "floor" || e.name == "wet") {
            if (e.name == "floor") {
                e.normalScale.addScalar(-0.8)
            }
            e.transparent = false
            e.combine = 2;
            e.needsUpdate = true
        }
    });

    let matLes = vorodorRuin.getObjectByName("les")
    matLes.material.forEach(e => {
        if (e.name.slice(0, 4) == "alfa") e.alphaTest = 0.5
    });

    let ruinShadow = vorodorRuin.getObjectByName("ruinShadow")
    ruinShadow.material.forEach((m) => {
        m.transparent = true
        m.blending = 4
        if (m.name == "matStatuetShadow") window.matStatuetShadow = m.emissiveMap
    })

    let statuet = vorodorRuin.getObjectByName("statuet")

    statuet.material.forEach(e => {
        e.lightMap = matStatuetShadow
        e.color.setScalar(0.001)
        e.lightMapIntensity = 1000
        e.emissiveIntensity = 0.01
        if (e.name == "zmei" || e.name == "man") {
            e.combine = 2;
            e.needsUpdate = true
        }

    });
    let mirrorStatuet = statuet.clone()
    mirrorStatuet.scale.z = -1
    mirrorStatuet.rotation.set(0, 0, 0)
    mirrorStatuet.position.set(0, 0, 0)
    statuet.add(mirrorStatuet)

    let water = vorodorRuin.getObjectByName("water")
    water.emissiveIntensity = 0
    splashWater(water.material)

    let sky = vorodorRuin.getObjectByName("sky")
    sky.material.fog = false

    let luna = vorodorRuin.getObjectByName("luna")
    luna.material.fog = false
    luna.material.blending = 2
    luna.material.transparent = true

    let dropMesh = vorodorRuin.getObjectByName("drop")
    dropMesh.material.depthWrite = false
    dropMesh.material.emissiveIntensity = 0;
    dropMesh.material.side = 2
    dropMesh.material.combine = 2
    dropMesh.material.blending = 2
    dropMesh.material.needsUpdate = true


    let rainMesh = vorodorRuin.getObjectByName("rain")
    rainMesh.material.side = 2
    rainMesh.material.depthWrite = false
    rainMesh.material.blending = 2
    rainMesh.material.transparent = true


    for (let i = 1; i < 50; i++) {
        Rain(dropMesh, rainMesh, 1, -511, 511, -800, 530)
    }
    for (let i = 1; i < 50; i++) {
        Rain(null, rainMesh, 300, -2000, -520, -800, 1500)
        Rain(null, rainMesh, 300, 520, 2000, -800, 1500)
        Rain(null, rainMesh, 1, -1500, 1500, -1500, -750)
        Rain(null, rainMesh, 1, -511, 511, 550, 3000)
    }

    vorodorRuin.getObjectByName("alfaFon").material.alphaTest = 0.5

    viewer.scene.add(vorodorRuin)

    let mirror = vorodorRuin.clone()
    mirror.scale.set(-1, 1, 1);
    mirror.remove(mirror.getObjectByName("les"))
    mirror.remove(mirror.getObjectByName("sky"))
    mirror.remove(mirror.getObjectByName("luna"))
    mirror.remove(mirror.getObjectByName("alfaFon"))
    mirror.remove(mirror.getObjectByName("drop"))
    mirror.remove(mirror.getObjectByName("rain"), mirror.getObjectByName("lightnings"))
    viewer.scene.dispose()
    viewer.userFunc = () => {
        viewer.camera.position.clamp(minVec, maxVec)
        sky.material.emissiveMap.offset.x -= 0.0002
    }
    viewer.ArreyCollisionMesh = [statuet, ruinShadow, mirror.getObjectByName("statuet"), mirror.getObjectByName("ruinShadow")]

    viewer.scene.add(mirror)

    // let box0 = new THREE.Mesh( new THREE.BoxBufferGeometry(1,1),new  THREE.MeshPhongMaterial())
    // box0.position.set(0,0.5,0)
    // viewer.scene.add(box0)

    ////////////////////// Молния ///////////
    lightning(vorodorRuin.getObjectByName("lightnings").children)


    function Rain(meshDrop, meshRain, bottomY, minX, maxX, minZ, maxZ) {
        meshRain = rainMesh.clone()
        viewer.scene.add(meshRain)

        if (meshDrop !== null) {
            meshDrop = dropMesh.clone()
            viewer.scene.add(meshDrop)
        }

        let clockStartDrop, time
        meshRain.position.y = Math.random() * 1500
        start(Math.random() * 1500)

        function start(y) {
            meshRain.rotation.z = viewer.camera.rotation.y
            meshRain.position.set(
                Math.random() * (maxX - minX) + minX,
                y + Math.random() * 30,
                Math.random() * (maxZ - minZ) + minZ
            )
        }
        function moveY() {
            if (meshRain.position.y < bottomY) {
                if (meshDrop !== null) {
                    meshDrop.visible = true
                    meshDrop.position.set(meshRain.position.x, bottomY, meshRain.position.z)
                    clockStartDrop = Date.now()
                    animationDrop()
                }
                start(1500)
            }
            else meshRain.position.y -= 30
            requestAnimationFrame(moveY);
        }
        function animationDrop() {
            time = (Date.now() - clockStartDrop)
            let s = time / 100          // всегда увеличивается

            if (time < 100) meshDrop.scale.setScalar(s + 0.01)
            else if (time < 300) {
                let i = 3.01 - s
                meshDrop.scale.set(s, s, i)
            }
            else {
                meshDrop.visible = false
                return
            }
            requestAnimationFrame(animationDrop);
        }
        moveY()
    }


}


function lightning(arrMesh) {
    arrMesh.forEach(e => {
        e.material.fog = false
        e.material.transparent = true
        e.material.depthWrite = false
        e.material.blending = 2
        e.visible = false
    })

    function start() {
        let num = Math.floor(Math.random() * arrMesh.length)
        let mesh = arrMesh[num]
        mesh.visible = true

        let euler = new THREE.Euler(Math.random() - 1.57, Math.random() * 3.14, Math.random() * 3.14, 'YXZ');
        mesh.quaternion.setFromEuler(euler)
        viewer.renderer.toneMappingExposure = 2

        setTimeout(() => {
            mesh.visible = false
            viewer.renderer.toneMappingExposure = 1
            setTimeout(start, Math.random() * 2e4)
        }, 100)
    }
    setTimeout(start, 5000)
}

function splashWater(mat) {
    mat.normalMap.wrapS = mat.normalMap.wrapT = 1001        // текстура без повторения
    mat.normalMap.needsUpdate = true
    mat.normalScale.setScalar(0.1)
    let x, y, i = 1

    function run() {
        i *= 0.878
        mat.normalMap.repeat.addScalar(i * -1)

        if (mat.normalMap.repeat.x < 3) {
            mat.normalMap.repeat.setScalar(10)
            i = 1
            x = Math.random() - 0.5
            y = Math.random() - 0.5
            mat.normalMap.offset.set(x, y) // смещение от -0,5 до 0,5 x y

            mat.normalMap.center.set(x * -1 + 0.5, y * -1 + 0.5)    // инвентирую и добавляю половину это центр
        }
        requestAnimationFrame(run)
    }
    run()
}





function TextureAnimator(texture, numTiles, tileDispDuration) {

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    let withTile = 1 / numTiles
    texture.repeat.set(withTile, 1);

    setInterval(() => {
        texture.offset.x += withTile
    }, tileDispDuration)
}
