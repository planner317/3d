

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

    t.run = 1 // коэфициент скорости от 1 без ограничений

    t.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    t.camera.near=0.001
    t.scene.add(t.camera);

    t.camera.position.y = 25;

    t.oldPosition = new THREE.Object3D();   // предыдущая позиция камеры

    t.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    t.camera2.position.z = 20

    t.camera.add(t.camera2)

    ////////////////////////// полушар с 50 вершинами для отбрасывание луча
    var geometry = new THREE.SphereGeometry(3, 10, 10)
    var material = new THREE.MeshPhongMaterial({ color: 0x4444ff, });
    t.player = new THREE.Mesh(geometry, material)
    t.scene.add(t.player)
    t.camera.add(t.player)

    t.ray = new THREE.Raycaster();
    // t.ray.far = 10
    //////////////////////// глобальное освещение
    t.pointLight = new THREE.PointLight(0xffffff);
    t.pointLight.intensity = 0.8;
    t.pointLight.position.y = 50
    t.scene.add(t.pointLight);

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
        .setPath('model/testColision/')
        .load('model.mtl', function (materials) { // callmback функция вызывается после загрузки

            materials.preload();

            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath('model/testColision/')
                .load('model.obj', function (object) {
                    t.model = object
                    t.scene.add(object)
                    download.remove()
                    t.colizMesh = object.children
                    t.loaden = true
                }, onProgress, onError);
        });


    t.resize = () => {
        t.camera.aspect = window.innerWidth / window.innerHeight;
        t.camera2.aspect = window.innerWidth / window.innerHeight;
        t.camera.updateProjectionMatrix();
        t.camera2.updateProjectionMatrix();
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

            newSubOld = t.camera.position.clone().sub(t.oldPosition.position) // разница новой позиции и старой

            dis = t.camera.position.distanceTo(t.oldPosition.position)  // дистанция новой позиции и старой
            if (dis) {    // если есть эта дистанция
                t.run +=0.05
                    /////////// функция определит растояние до стены. равномерно уменьшает run от дистанции 6 до 3
                    stooped();
            }
            else t.run -=0.05

            t.run = Math.min(Math.max(0.000001, t.run), 1); // диапозон

            if (cam2.checked) t.renderer.render(t.scene, t.camera2);
            else t.renderer.render(t.scene, t.camera);
            t.oldPosition.position.copy(t.camera.position.clone())
        }
        requestAnimationFrame(t.animate);
    }

    //////////////тормаз////
    function stooped() {

        t.ray.ray.origin = t.camera.position       // начало луча
        t.ray.ray.direction = newSubOld // направление луча ДОЛЖНО БЫТЬ СМЕЩЕНИЕ ОТ НУЛЯ ТО ЕСТЬ НОЛЬ ЭТО НАЧАЛО ЛУЧА
        let collisionResults = t.ray.intersectObjects(t.colizMesh); // массив с сетками для коллизии
        if (collisionResults.length) {

            log.innerHTML = collisionResults[0].distance

            if (collisionResults[0].distance < 6) {
                let d = (collisionResults[0].distance - 3) /3
                t.run = d
            }
        }
    }
}

