import * as THREE from "./jsm/three.module.js";
import TouchControl from "./jsm/controls/touchControl.js";
import keyBordMouseControl from "./jsm/controls/MouseAndKeyboardControlsFirstPerson.js"
import Stats from "./jsm/stats.module.js"
window.THREE = THREE;

const PATH = import.meta.url.match(/.+\//)[0]   //текущая папка


export default function Viewer() {
    let t = this
    let resolution = 720;

    /////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                     //
    /////////////////////////////////////////////////////////////////////////////////////////
    this.scene = new THREE.Scene();
    t.scene.background = new THREE.Color(0x223344)



    //cubemap
    this.setCubemap = (
        path = PATH + 'cubemap/poselok/',
        pathMiniCube,
        format = '.jpg',
        front = "front",
        right = "right",
        back = "back",
        left = "left",
        top = "top",
        bottom = "bottom",
    ) => {
        if (pathMiniCube) {
            //////// мелкий куб карта
            new THREE.CubeTextureLoader().load([
                pathMiniCube + left + format,
                pathMiniCube + right + format,
                pathMiniCube + top + format,
                pathMiniCube + bottom + format,
                pathMiniCube + back + format,
                pathMiniCube + front + format
            ], (cube) => { // callBack  
                t.scene.background = cube
                t.scene.environment = cube
                cubeNormal()
            });
        }
        else cubeNormal()

        function cubeNormal() {
            ////// норм куб карта
            new THREE.CubeTextureLoader().load([
                path + left + format,
                path + right + format,
                path + top + format,
                path + bottom + format,
                path + back + format,
                path + front + format
            ], (cube) => { // callBack
                t.scene.background = cube
                t.scene.environment = cube
            });
        }
    }

    ///////////////// массив сеток для коллизии
    this.ArreyCollisionMesh = t.scene.children

    let fpsView = false;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    document.body.append(t.renderer.domElement);


    let stats;  // fps

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    t.scene.add(t.camera)

    this.lightCamera = new THREE.PointLight(0xffffff, 1)
    t.lightCamera.layers.enable(20)
    t.camera.add(t.lightCamera)

    ////////////////////////////////////////// меняет разрешение canvas
    function resize() {
        t.camera.aspect = window.innerWidth / window.innerHeight;
        t.camera.updateProjectionMatrix();
        let orientation = window.innerWidth > window.innerHeight // 1 ланшафтная 0 портретная
        let coef = orientation ? window.innerHeight / resolution : window.innerWidth / resolution
        t.renderer.setSize(window.innerWidth / coef, window.innerHeight / coef);
        t.renderer.domElement.style.zoom = coef;
    }
    resize()
    let run = 1 // коэфициент скорости 1 без ограничений

    let oldPosition = new THREE.Object3D();   // предыдущая позиция камеры
    this.directionMove = 0                       // направление движения

    let ray = new THREE.Raycaster();
    this.rayDirectionMove = 0;                       // объект в направление движения

    //////////////////////// глобальное освещение
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    t.ambientLight.intensity = 0.2;
    t.ambientLight.visible = false;
    t.scene.add(t.ambientLight);

    //////////////////////// свет от солнца
    this.sunLight = new THREE.DirectionalLight();
    t.sunLight.position.set(7, 20, 10);
    t.sunLight.lookAt(t.scene.position);
    t.sunLight.visible = false;
    t.scene.add(t.sunLight);



    ///////////////////////// demo
    function f(a) {
        return Math.random() * a - a / 2
    }
    let g = new THREE.BoxBufferGeometry(0.01, 0.01, 0.01)
    for (let i = 0; i < 1000; i++) {                    // кубики
        let a = t.scene.children.length * 2
        let mat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff.toFixed(0) })
        let mesh = new THREE.Mesh(g, mat);
        mesh.position.set(f(a), f(a), f(a))
        mesh.scale.addScalar(mesh.position.distanceTo(t.scene.position) ** 1.5)
        this.scene.add(mesh)
    }
    /// шрифт и материал
    let font, material = new THREE.MeshPhysicalMaterial({
        metalness: 0.5,
        roughness: 0.05,
        //envMapIntensity: 3,
    })

    /////// загрузка 3D шрифта
    var loader = new THREE.FontLoader();
    loader.load(PATH + 'fonts/droid/droid_serif_bold.typeface.json', function (response) {
        font = response;
        let textGeo = new THREE.TextGeometry(" загрузка\n\n\n" + new Date().toLocaleDateString() + "\n  " + new Date().toTimeString().slice(0, 8), {
            font: font, size: 10, height: 2, curveSegments: 1, bevelEnabled: false, bevelThickness: 0.4, bevelSize: 0.4,
        });
        let textMeshLoad = new THREE.Mesh(textGeo, material);
        textMeshLoad.position.set(-34, 25, -100)
        t.scene.add(textMeshLoad)
        t.createText("  3D")
    });

    let textMesh, matText = material.clone()
    matText.color.setRGB(1, 0.1, 0.1)

    this.createText = (text) => {
        if (typeof text != "string") { console.log("createText пришел не текст"); return 0; }
        if (!font) { console.log("createText 3d шрифт еще не загружен"); return 0; }
        if (textMesh) {
            t.scene.remove(textMesh)
            t.scene.dispose()
        }
        let textGeo = new THREE.TextGeometry(text, {
            font: font,
            size: 20,          //Размер - Поплавок. Размер текста. По умолчанию 100.
            height: 10,         //Высота - Поплавок. Толщина для выдавливания текста. По умолчанию 50.
            curveSegments: 3, //CurveSegments - Целое число. Количество точек на кривых. По умолчанию 12.
            bevelEnabled: true, //bevelEnabled - логическое значение. Включите скос. По умолчанию это False.
            bevelThickness: 0.5, //BevelThickness - Поплавок. Как глубоко в текст идет скос. По умолчанию 10.
            bevelSize: 1,       //bevelSize - Float. Как далеко от контура текста скос. По умолчанию 8.
        });
        textMesh = new THREE.Mesh(textGeo, matText);
        textMesh.position.set(-27, -7, -105)
        t.scene.add(textMesh)
    }
    this.deleteAllMesh = () => {
        let e = t.scene.children
        for (let i = 0; i < e.length; i++) {
            if (e[i].type == "Mesh") {
                t.scene.remove(e[i]);
                i--;
            }
        }
        t.scene.dispose();
    }
    // движение мышкой в режиме pointerLock и движение клавой
    this.keyBordMouseControl = new keyBordMouseControl(t.camera, document.body);

    // уравление камерой с помощью сенсорного экрана, кидаем только камеру области для нажатия создает сам
    this.touchControl = new TouchControl(t.camera);

    let mode; // режим упарвление сенсором или клавиатурой с мышкой

    window.addEventListener("touchstart", () => mode = "sensor");
    window.addEventListener("mousedown", () => mode = "mouse");


    //////////////------------------------АНИМАЦИЯ------------------------///
    function animate() {


        if (fpsView) stats.update();

        if (mode == "sensor") t.touchControl.update(run);
        if (mode == "mouse") t.keyBordMouseControl.update(run)

        t.directionMove = t.camera.position.clone().sub(oldPosition.position) // разница новой позиции и старой
        t.directionMove.normalize()
        let distance = t.camera.position.distanceTo(oldPosition.position)  // дистанция новой позиции и старой
        if (distance) {    // если есть эта дистанция
            run += 0.05
            stooped(); // функция определит растояние до стены. равномерно уменьшает run от дистанции 6 до 1
        }
        else run -= 0.05

        run = Math.min(Math.max(0.000001, run), 1); // диапозон

        t.renderer.render(t.scene, t.camera);
        oldPosition.position.copy(t.camera.position)

        requestAnimationFrame(animate);
    }

    //////////////тормоз////
    function stooped() {

        ray.ray.origin = t.camera.position       // начало луча
        ray.ray.direction = t.directionMove // направление луча ДОЛЖНО БЫТЬ СМЕЩЕНИЕ ОТ НУЛЯ ТО ЕСТЬ НОЛЬ ЭТО НАЧАЛО ЛУЧА
        let collisionResults = ray.intersectObjects(t.ArreyCollisionMesh); // массив с сетками для коллизии
        if (collisionResults.length) {
            t.rayDirectionMove = collisionResults[0]

            if (collisionResults[0].distance < 6) {
                run = (collisionResults[0].distance - 1) / 5
            }
        }
        else t.rayDirectionMove = 0
    }
    animate();




    ////////////////////// менюшка ///////////////////////
    fetch(PATH + "menu.html")
        .then(res => res.text())
        .then(data => {
            let d = document.createElement("div")
            document.body.prepend(d)
            d.innerHTML += data

            menu.onclick = (e) => {
                //e.preventDefault()
                e.stopPropagation()
            }
            // клик по бургеру показывает меню
            menuView.onclick = (e) => {
                if (menu.style.visibility == "visible") { menu.style.visibility = "hidden"; fpsView = false }
                else { menu.style.visibility = "visible"; fpsView = true }
                e.stopPropagation()
            }
            // полный экран
            full.onclick = () => {
                if (document.fullscreen) document.exitFullscreen()
                else document.documentElement.requestFullscreen()
            }
            speedSet.oninput = () => {
                speedView.innerText = "чувствительность сенсора " + speedSet.value;
                t.touchControl.speed = speedSet.value
            }

            window.addEventListener("mousedown", hideInfo)
            window.addEventListener("touchstart", hideInfo)

            function hideInfo() {
                info.remove();
                window.removeEventListener("mousedown", hideInfo)
                window.removeEventListener("touchstart", hideInfo)
            }
            // клик по разрешению
            domResolution.onclick = setResolution;
            function setResolution(e) {
                if (e.target.tagName == "INPUT") resolution = e.target.value
                resize(); getRes()
            }
            //////////////////////////////// FPS
            stats = new Stats()
            fps.append(stats.dom);

            function getRes() {                     // записывает изменеие в меню
                resView.innerHTML = window.innerWidth + " x " + window.innerHeight
                    + "<br>canvas<br>"
                    + t.renderer.domElement.width + " x " + t.renderer.domElement.height;
            }
            getRes()
            window.addEventListener('resize', setResolution, false);

            ///////////////////////////////////////////////////////////////////////////////////////////////////////

            setMat.innerHTML = `             
        <img src="${PATH}media/back.jpg" id="menuBack"> <span style="font-size: 25px;">материал</span> <br>
        <img src="${PATH}media/off.png" id="menuNo">
        <img src="${PATH}media/1.jpg" id="menue3">
        <img src="${PATH}media/2.jpg" id="menue4">
        <img src="${PATH}media/3.jpg" id="menuW">
        <img src="${PATH}media/4.jpg" id="menuWfog">
        <img src="${PATH}media/5.jpg" id="menuWfog2">
        <img src="${PATH}media/6.jpg" id="menuWfog3">
        <img src="${PATH}media/7.jpg" id="menue1">
        <img src="${PATH}media/8.jpg" id="menue2">
        `

            setTimeout(() => {
                ////////////////// доп эффект /////


                let basic = new THREE.MeshBasicMaterial()
                let physic = new THREE.MeshPhysicalMaterial();
                let physic2 = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0 });
                let physic3 = new THREE.MeshPhysicalMaterial({ metalness: 2, roughness: 0 });
                let physic4 = new THREE.MeshPhysicalMaterial({ metalness: 3, roughness: 0.77 });
                let physic5

                let e1
                new THREE.TextureLoader().load(PATH + "media/360.jpg", (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    e1 = texture
                })
                new THREE.TextureLoader().load(PATH + "media/normal/pebble_normal.JPG", (texture) => {
                    texture.repeat.set(10, 10)
                    texture.wrapS = THREE.RepeatWrapping
                    texture.wrapT = THREE.RepeatWrapping
                    physic5 = new THREE.MeshPhysicalMaterial({ normalMap: texture, metalness: 0.5, roughness: 0.5 });
                })
                function setOverrideMaterial(even) {
                    t.scene.traverse((e) => {
                        if (e.type == "Mesh") e.layers.enable(20)
                    })
                    let e = even.target.id

                    if (e == "menuBack") return
                    if (e == "menuNo") {
                        t.scene.environment = 0
                        t.scene.overrideMaterial = 0
                        t.scene.fog = 0;
                        t.camera.far = 10000
                        t.lightCamera.visible = false
                        t.camera.layers.set(0)
                    }
                    else {
                        t.camera.layers.set(20)
                        t.scene.background = new THREE.Color(0, 0, 0)
                        t.scene.overrideMaterial = physic
                        t.camera.far = 10000
                    }

                    if (e == "menuW") {
                        t.scene.environment = 0
                        t.scene.overrideMaterial = physic
                        t.scene.fog = 0
                        t.scene.overrideMaterial.wireframe = true
                        t.scene.overrideMaterial.flatShading = false
                        t.lightCamera.visible = true
                        t.camera.far = 10000
                    }
                    if (e == "menuWfog") {
                        t.scene.environment = 0
                        t.scene.overrideMaterial = basic
                        t.scene.fog = new THREE.Fog(0, 1, 1000)
                        t.scene.overrideMaterial.wireframe = true
                        t.scene.overrideMaterial.flatShading = false
                        t.lightCamera.visible = false
                        t.camera.far = 1000
                    }
                    if (e == "menuWfog2") {
                        t.scene.environment = 0
                        t.scene.overrideMaterial = basic
                        t.scene.fog = new THREE.Fog(0, 1, 500)
                        t.scene.overrideMaterial.wireframe = false
                        t.scene.overrideMaterial.flatShading = false
                        t.camera.far = 500
                        t.lightCamera.visible = false
                    }
                    if (e == "menuWfog3") {
                        t.scene.environment = 0
                        t.scene.overrideMaterial = basic
                        t.scene.fog = new THREE.Fog(0, 1, 100)
                        t.scene.overrideMaterial.wireframe = false
                        t.scene.overrideMaterial.flatShading = false
                        t.lightCamera.visible = false
                        t.camera.far = 100
                    }
                    if (e == "menue1") {
                        t.scene.overrideMaterial = physic2
                        t.scene.fog = 0
                        t.scene.environment = e1
                        t.scene.overrideMaterial.wireframe = false
                        t.scene.overrideMaterial.flatShading = false
                        t.lightCamera.visible = false
                        t.camera.far = 10000
                    }
                    if (e == "menue2") {
                        t.scene.overrideMaterial = physic3
                        t.scene.environment = e1
                        t.scene.fog = 0
                        t.scene.overrideMaterial.wireframe = false
                        t.scene.overrideMaterial.flatShading = false
                        t.lightCamera.visible = true
                        t.camera.far = 10000
                    }
                    if (e == "menue3") {
                        t.scene.overrideMaterial = physic4
                        t.scene.environment = e1
                        t.scene.fog = 0
                        t.scene.overrideMaterial.wireframe = false
                        t.scene.overrideMaterial.flatShading = true
                        t.lightCamera.visible = true
                        t.camera.far = 10000
                    }
                    if (e == "menue4") {
                        t.scene.overrideMaterial = physic5
                        t.scene.environment = e1
                        t.scene.fog = 0
                        t.scene.overrideMaterial.wireframe = false
                        t.scene.overrideMaterial.flatShading = false
                        t.lightCamera.visible = true
                        t.camera.far = 10000
                    }


                    t.camera.updateProjectionMatrix()
                    if (t.scene.overrideMaterial) t.scene.overrideMaterial.needsUpdate = true
                }

                setMat.onclick = setOverrideMaterial;
                menuBack.onclick = () => {
                    menuBase.style.display = "block"
                    setMat.style.display = "none"
                }
                MenuMaterial.onclick = () => {
                    menuBase.style.display = "none"
                    setMat.style.display = "block"
                }
            }, 2000)
        })
}