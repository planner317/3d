let ddd = new Ddd()
ddd.animate();

//////////////////////// менюшка ///////////////////////
menuView.onclick = (e) => {
    e.stopPropagation()
    e.preventDefault();
    if (menu.style.visibility == "visible") menu.style.visibility = "hidden"
    else menu.style.visibility = "visible"
}
menu.onclick = (e) => {
    e.stopPropagation()
    //e.preventDefault();
}
full.onclick = () => {
    if (document.fullscreen) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
}
speedSet.oninput = () => {
    speedView.innerText = "чувствительность сенсора " + speedSet.value;
    ddd.touchControl.speed = speedSet.value
}

window.addEventListener("mousedown", hideInfo)
window.addEventListener("touchstart", hideInfo)

function hideInfo(e) {

    info.remove();
    window.removeEventListener("mousedown", hideInfo)
    window.removeEventListener("touchstart", hideInfo)
}
function setResolution(r) {
    ddd.resolution = r
    ddd.resize()
}
fps.onchange = () => { if (fps.checked) ddd.stats.setMode(0); else ddd.stats.setMode(); return false }

//////////////////////// 3d пространство
function Ddd() {
    let t = this
    t.loaden = false;
    t.scene = new THREE.Scene();
    t.scene.background = new THREE.Color(0x223344)
    t.renderer = new THREE.WebGLRenderer({ antialias: true });
    t.resolution = 720
    document.body.append(t.renderer.domElement);

    t.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    t.camera.position.y = 25;
    t.run = 1 // коэфициент скорости от 1 без ограничений

    t.oldPosition = new THREE.Object3D();   // предыдущая позиция камеры
    t.newSubOld = 0 // разница новой позиции и старой
    t.distance = 0 // дистанция между новой и старой

    t.ray = new THREE.Raycaster();
    //t.ray.far = 10
    //////////////////////// глобальное освещение
    t.ambientLight = new THREE.AmbientLight(0xffffff);
    t.ambientLight.intensity = 1;
    t.scene.add(t.ambientLight);

    //////////////////////// свет от мониторов ////////////
    t.ligtScreen = new THREE.SpotLight()
    t.ligtScreen.penumbra = 0.1
    t.ligtScreen.distance = 130
    t.ligtScreen.position.set(45, 20, -20)
    t.ligtScreen.target.position.set(-50, 30, -17)

    t.ligtScreen.intensity = 0.3
    t.scene.add(t.ligtScreen)
    t.scene.add(t.ligtScreen.target)

    t.nightflag = 0;
    //////////////////////////////// FPS
    t.stats = new Stats()
    fps.append(t.stats.dom);

    // движение мышкой в режиме pointerLock и движение клавой
    t.pointerLook = new THREE.MouseAndKeyboardControlsFirstPerson(t.camera, document.body);

    // уравление камерой с помощью сенсорного экрана, кидаем только камеру области для нажатия создает сам
    t.touchControl = new TouchControl(t.camera);

    t.mode; // режим упарвление сенсором или клавиатурой с мышкой

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            download.style.lineHeight = window.innerHeight / 1.5 + "px";
            download.innerHTML = `загрузка ${Math.round(percentComplete, 2)}%`;
        }
    };

    var onError = function () { };

    var manager = new THREE.LoadingManager();

    ///////////////////////
    new THREE.MTLLoader(manager)
        .setPath('model/room/')
        .load('room.mtl', function (materials) { // callback функция вызывается после загрузки

            materials.preload();

            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath('model/room/')
                .load('room.obj', function (object) {
                    t.room = object
                    object.getObjectByName("collizian").material.visible = false
                    object.getObjectByName("offon").material.visible = false

                    t.room.add(t.ligtScreen)
                    t.mirrorRoom = t.room.clone();
                    t.mirrorRoom.scale.x = -1
                    t.mirrorRoom.position.x = -105.4
                    t.scene.add(object)
                    t.scene.add(t.mirrorRoom)
                    t.mirrorRoom.getObjectByName("ghost").visible = false

                    t.visible = [
                        object.getObjectByName("ssss"),
                        t.mirrorRoom.getObjectByName("ssss"),
                        object.getObjectByName("windowDark"),
                        t.mirrorRoom.getObjectByName("windowDark"),
                        object.getObjectByName("ghost"),
                    ];
                    texture = new THREE.VideoTexture(video);
                    t.visible[0].material.emissiveMap = texture;
                    t.visible[1].material.emissiveMap = texture;

                    texture2 = new THREE.VideoTexture(video2);
                    t.visible[4].material[0].emissiveMap = texture2;

                    //t.night()
                    t.visible.forEach((e) => {
                        e.visible = false
                    })
                    t.colizMesh = [t.room.children[0], t.mirrorRoom.children[0],
                    object.getObjectByName("offon"), t.mirrorRoom.getObjectByName("offon"), t.visible[4]];

                    t.loaden = true
                    download.remove()
                }, onProgress, onError);
        });


    t.resize = () => {
        t.camera.aspect = window.innerWidth / window.innerHeight;
        t.camera.updateProjectionMatrix();
        let oritntac = window.innerWidth > window.innerHeight // 1 ланшафтная 0 портретная
        let coef = oritntac ? window.innerHeight / t.resolution : window.innerWidth / t.resolution
        t.renderer.setSize(window.innerWidth / coef, window.innerHeight / coef);
        t.renderer.domElement.style.zoom = coef;
        getRes();
    }

    t.onWinResize = t.resize

    function getRes() {
        resView.innerHTML = "внешнее<br>"
            + window.outerWidth + " x " + window.outerHeight
            + "<br>внутрение<br>"
            + window.innerWidth + " x " + window.innerHeight
            + "<br>canvas<br>"
            + t.renderer.domElement.width + " x " + t.renderer.domElement.height;
    }
    t.resize();
    window.addEventListener('resize', t.onWinResize, false);

    window.addEventListener("touchstart", () => t.mode = "sensor");

    //////////////------------------------АНИМАЦИЯ------------------------///
    t.animate = () => {

        if (t.loaden) {
            if (menu.style.visibility == "visible") t.stats.update();

            if (t.mode == "sensor") t.touchControl.update(t.run);
            else t.pointerLook.update(t.run)

            t.newSubOld = t.camera.position.clone().sub(t.oldPosition.position) // разница новой позиции и старой

            t.distance = t.camera.position.distanceTo(t.oldPosition.position)  // дистанция новой позиции и старой
            if (t.distance) {    // если есть эта дистанция
                t.run += 0.05
                /////////// функция определит растояние до стены. равномерно уменьшает run от дистанции 6 до 3
                stooped();
            }
            else t.run -= 0.05

            t.run = Math.min(Math.max(0.000001, t.run), 1); // диапозон

            t.renderer.render(t.scene, t.camera);
            t.oldPosition.position.copy(t.camera.position.clone())

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
        requestAnimationFrame(t.animate);
    }

    //////////////тормаз////
    function stooped() {

        t.ray.ray.origin = t.camera.position       // начало луча
        t.ray.ray.direction = t.newSubOld // направление луча ДОЛЖНО БЫТЬ СМЕЩЕНИЕ ОТ НУЛЯ ТО ЕСТЬ НОЛЬ ЭТО НАЧАЛО ЛУЧА
        let collisionResults = t.ray.intersectObjects(t.colizMesh); // массив с сетками для коллизии
        if (collisionResults.length) {

            if (collisionResults[0].distance < 6) {
                t.run = (collisionResults[0].distance - 1) / 5
            }
            ////////////// выключатель в зеркале
            if (collisionResults[0].distance < 3 && collisionResults[0].object == t.colizMesh[3]) {
                t.night()
            }
            ////////////// призрак скример и вырубить
            if (collisionResults[0].distance < 20 && collisionResults[0].object == t.colizMesh[4]) {
                t.day()
            }
        }
    }

    t.night = () => {
        if (t.nightflag == 0) {

            t.visible.forEach((e) => {
                e.visible = true
            })
            t.ambientLight.intensity = 0.05
            t.nightflag = 1
            video.play();
            video2.play();
        }
    }

    let pOld
    function intensityScreen(p) {
        if (p != pOld) {
            t.ligtScreen.intensity = p
            t.mirrorRoom.children[15].intensity = p
            pOld = p
        }
    }

    t.day = () => {
        t.nightflag = 0;
        video.pause()
        video2.pause()
        screamer.currentTime = 0;
        screamer.style.display = "block"
        screamer.play();
        screamer.onended = () => {
            screamer.style.display = "none";
            screamer.currentTime = 0;
            t.ambientLight.intensity = 1;
            t.visible.forEach((e) => {
                e.visible = false
            })
        }
    }
}