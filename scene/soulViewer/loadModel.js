import * as THREE from "../../viewer/jsm/three.module.js";
import { FBXLoader } from "../../viewer/jsm/loaders/FBXLoader.js"
import { GUI, gui } from '../../viewer/jsm/libs/dat.gui.module.js';
let manager = new THREE.LoadingManager();
let clock = new THREE.Clock();


manager.onLoad = ()=>{      // после загрузки всех текстур
    load.innerHTML = ""
}
manager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {    // менеджер текстур что в файле fbx
    load.innerHTML = "подгружаются текстуры " + itemsLoaded + "/" + itemsTotal + " " + urlOfLastItemLoaded
  };


let modelsList = {
    "raziel1": {
        name: "raziel1",
        init: function (model) { model.getObjectByName("wings").material.side = 2 },
        animation: []
    },
    "raziel": {
        name: "raziel",
        init: function (model) {
            paramA["idle (2)"]()
            model.getObjectByName("wings").material.side = 2
            model.traverse(e => {
                if (e.isMesh) e.material.normalScale.setScalar(2)
            });
        },
        animation: [
            "cover to stand (2)",
            "cover to stand",
            "falling to roll",
            "hard landing",
            "idle (2)",
            "idle (3)",
            "idle",
            "running",
            "walking",
            "drunk",
        ]
    },
    "kain": {
        name: "kain",
        init: function (model) {
            paramA["idle (4)"]()

            let danceFolder = folderA.addFolder("Dance")            //создать папку в папке
            modelsList["kain"].dance.forEach(e => {
                paramA[e] = () => {
                    new FBXLoader(manager).setPath(`../soulreaver/model/kain/animate/`) //загрузка анимации
                        .load(`${e}.fbx`,

                            //аргумент колбек
                            function (object) { // колбек после загрузки
                                action.stop()
                                action = mixer.clipAction(object.animations[0]);
                                action.play()
                                animate()
                                load.innerHTML = ""
                                model.getObjectByName("kain_sword").material.visible = false
                            }, progressAnimation);
                }
                danceFolder.add(paramA, e)
            })
            danceFolder.open();
        },
        animation: [
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
            "attack",
            "block idle",
            "casting (2)",
            "casting",
            "death (2)",
            "death",
            "jump (2)",
            "kick",
            "power up",],
        dance: [
            "Slide Hip Hop Dance",
            "Wave Hip Hop Dance",
            "Breakdance Freezes (1)",
            "Gangnam Style (1)",
            "Swing Dancing",
            "Robot Hip Hop Dance",
            "Hip Hop Dancing",
            "Shuffling",
        ],
    },
    "firedemon": {
        name: "firedemon",
        init: function (model) { },
        animation: []
    },
    "guardian": {
        name: "guardian",
        init: function (model) {
            Object.assign(model.getObjectByName("head").material, { alphaTest: 0.8, })
            Object.assign(model.getObjectByName("body").material, { alphaTest: 0.8, })
        },
        animation: []
    },
    "hylden": {
        name: "hylden",
        init: function (model) { },
        animation: []
    },
    "janos": {
        name: "janos",
        init: function (model) { model.getObjectByName("tran").material.side = 2 },
        animation: []
    },
    "lightdemon": {
        name: "lightdemon",
        init: function (model) { },
        animation: []
    },
    "moebius": {
        name: "moebius",
        init: function (model) { 
            model.getObjectByName("tkan").material.side = 2
            paramA["idle"]()
     },
        animation: [
            "Magic Attack",
            "2H Magic Area Attack 02",
            "idle 02",
            "idle",
            "Jump",
            "React Death Backward",
            "React Large From Front",
            "React Small From Front",
            "Run Back",
            "Run Forward",
            "Turn Left 90",
            "Turn Right 90",
            "Walk Back",
            "Walk Forward",
        ]
    },
    "mortanius": {
        name: "mortanius",
        init: function (model) {
            model.getObjectByName("tkan").material.side = 2
        },
        animation: []
    },
    "revenant_a": {
        name: "revenant_a",
        init: function (model) {
            Object.assign(model.getObjectByName("hair").material, { alphaTest: 0.8, side: 2 })
        },
        animation: []
    },
    "revenant_h": {
        name: "revenant_h",
        init: function (model) {
            window.aa = model.getObjectByName("metal1").material
            model.getObjectByName("metal1").material.normalScale.setScalar(0.2)
            model.getObjectByName("metal1").material.shininess = 30
        },
        animation: []
    },
    "sluagh": {
        name: "sluagh",
        init: function (model) {
            model.getObjectByName("head").material.normalScale.setScalar(0.4)
            model.getObjectByName("body").material.normalScale.setScalar(0.4)
        },
        animation: []
    },
    "turel": {
        name: "turel",
        init: function (model) {

        },
        animation: []
    },
    "vorador": {
        name: "vorador",
        init: function (model) { },
        animation: []
    },
}



let mixer, action, percentComplete, loadModel = "complete"
let param = {} // объект с функциями вызываются при нажатии мышкой в GUI
let paramA = {} // объект с функциями включение анимации
let guiUser
let folderA
///////////////////////////------------------------- загрузчик моделей fbx
export default function LoadModel(scene) {
    let rootModel = new THREE.Group()
    scene.add(rootModel)
    guiUser = new GUI();
    guiUser.domElement.onclick = (e) => e.stopPropagation()
    guiUser.domElement.style.opacity = 0.8
    guiUser.width = 200

    let folderM = guiUser.addFolder('Models');
    folderM.close()
    folderA = guiUser.addFolder("Animation")            //создать папку

    for (let key in modelsList) {
        let name = modelsList[key].name             // имя модели
        param[name] = () => {   // функция в param с именем модели
            if (loadModel == "loading") {
                warning.innerHTML ="дождитесь загузки"
                return
            }
            loadModel = "loading"
            rootModel.remove(...rootModel.children) //удалит старую модель

            new FBXLoader(manager).setPath(`../soulreaver/model/${name}/`) //загрузка модели
                .load(`${name}.fbx`,

                    //аргумент колбек
                    function (model) {
                        loadModel = "complete"
                        rootModel.add(model)   // добавить модель в сцену

                        rootModel.traverse((e) => {
                            if (e.isMesh) {
                                e.castShadow = true
                                e.receiveShadow = true
                            }
                        });
                        if (model.animations.length) {
                            mixer = new THREE.AnimationMixer(model);
                            action = mixer.clipAction(model.animations[0]);
                        }

                        load.innerHTML = ""
                        warning.innerHTML = ""
                        /////////////////// заполняю папку анимация к модели
                        guiUser.removeFolder(guiUser.__folders.Animation)       //удалить папку
                        folderA = guiUser.addFolder("Animation")            //создать папку
                        paramA = {};
                        //////////////   функции при нажатии на анимацию
                        modelsList[key].animation.forEach(e => {
                            paramA[e] = () => {
                                if (loadModel == "loading") {
                                    warning.innerHTML ="дождитесь загузки"
                                    return
                                }
                                loadModel = "loading"
                                
                                new FBXLoader(manager).setPath(`../soulreaver/model/${name}/animate/`) //загрузка анимации
                                    .load(`${e}.fbx`,

                                        //аргумент колбек
                                        function (object) { // колбек после загрузки
                                            loadModel = "complete"
                                            action.stop()
                                            action = mixer.clipAction(object.animations[0]);
                                            action.play()
                                            animate()
                                            load.innerHTML = ""
                                            warning.innerHTML = ""
                                        }, progressAnimation);
                            }
                            folderA.add(paramA, e)
                        })
                        folderA.open()
                        modelsList[key].init(model)  // индивидуальная поднастройка модели
                    }
                    , progressModel)

        }
        folderM.add(param, name) // объект , ключ
    }
}

function progressModel(xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 99;
        load.innerHTML = `загрузка модели ${Math.round(percentComplete)}%`
    }
}
function progressAnimation(xhr) {
    if (xhr.lengthComputable) {
        percentComplete = xhr.loaded / xhr.total * 99;
        load.innerHTML = `загрузка анимации ${Math.round(percentComplete)}%`
    }
}
function animate() {
    var delta = clock.getDelta();

    mixer.update(delta);

    requestAnimationFrame(animate);
}