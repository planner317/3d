

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

    t.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    t.scene.add(t.camera);
    t.camhelp= new THREE.CameraHelper(t.camera)
    t.scene.add(t.camhelp)

    t.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    t.scene.add(t.camera2);

    
    ////////////////////////// полушар с 50 вершинами для отбрасывание луча
    var geometry = new THREE.SphereGeometry(3, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2)
    var wireMaterial = new THREE.MeshBasicMaterial({ color: 0x0, wireframe: true });
    t.collizGeometry = new THREE.Mesh(geometry, wireMaterial)
    t.scene.add(t.collizGeometry)

    //созднаие кучи 3дОбъектов из координат вершин
    t.collizPointDDDD = []
    for (let i = 0; i < t.collizGeometry.geometry.vertices.length; i++) {
        let vertex = t.collizGeometry.geometry.vertices[i].clone()               // координаты одной из вершин

        var geometry = new THREE.SphereGeometry(0.05, 2, 2)
        var wireMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, wireframeLinewidth:0.1 });
        t.collizPointDDDD.push(new THREE.Mesh(geometry, wireMaterial));
        t.collizPointDDDD[i].position.copy(vertex)
        t.collizGeometry.add(t.collizPointDDDD[i])
    }

    t.camera.position.y = 25;

    t.oldPosition = new THREE.Object3D();   // предидущая позиция камеры

    // t.scene.add(t.oldPosition)

    t.collizPoint = []
    /////////////////////////////  коллизия
    for (let i = 0; i < t.collizGeometry.geometry.vertices.length; i++) {

        var geometry = new THREE.SphereGeometry(0.5, 2, 2)
        var wireMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        t.collizPoint.push(new THREE.Mesh(geometry, wireMaterial));
        t.scene.add(t.collizPoint[i])
    }

    t.ray = new THREE.Raycaster();
    // t.ray.far = 10
    //////////////////////// глобальное освещение
    t.pointLight = new THREE.PointLight(0x77aaff);
    t.pointLight.intensity = 0.5;
    t.pointLight.position.y=50
    t.scene.add(t.pointLight);

    t.spotLight = new THREE.SpotLight()
    t.spotLight.intensity=1
    t.scene.add(t.spotLight)
    t.camera.add(t.spotLight)
    t.camera.add(t.spotLight.target)
    t.spotLight.target.position.z=-1;
    t.spotLight.position.y=0;
    t.spotLight.penumbra=0.2
    t.spotLight.angle=0.8
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

    t.animate = () => {

        requestAnimationFrame(t.animate);
        if (t.loaden) {

            t.camera2.position.x=t.camera.position.x;
            t.camera2.position.z=t.camera.position.z+30;
            t.camera2.position.y=30
            t.camera2.lookAt(t.camera.position)


            if (t.mode == "sensor") t.touchControl.update();
            else t.pointerLook.update()

            if (menu.style.visibility == "visible") t.stats.update();

            v3 = t.camera.position.clone().sub(t.oldPosition.position) // разница новой позиции и старой

            r = t.camera.position.distanceTo(t.oldPosition.position)  // дистанция новой позиции и старой
            if (r) {    // если есть эта дистанция
                let arrDistans=[];
                t.collizGeometry.position.copy(t.camera.position);
                t.collizGeometry.lookAt(t.oldPosition.position)  // повернуть морду
                t.collizGeometry.rotateX(-Math.PI / 2)
                //t.collizGeometry.rotation.z=Math.random()

                for (let i = 0; i < t.collizPointDDDD.length; i++) {
                    let pos = t.collizPointDDDD[i].localToWorld(new THREE.Vector3())               // координаты одной из вершин
                    pos.sub(t.camera.position)
                    t.ray.ray.origin = t.camera.position       // начало луча
                    t.ray.ray.direction = pos               // направление луча ДОЛЖНО БЫТЬ СМЕЩЕНИЕ ОТ НУЛЯ ТО ЕСТЬ НОЛЬ ЭТО НАЧАЛО ЛУЧА
                    var collisionResults = t.ray.intersectObjects(t.colizMesh); // массив с сетками для коллизии
                    if (collisionResults.length) {
                        t.collizPoint[i].position.copy(collisionResults[0].point)   // поставить фигуру на место падение луча

                        if (collisionResults[0].distance < 3) {
                            arrDistans.push({
                                distance: collisionResults[0].distance,
                                vectorDirec: pos
                            })
                        }
                    }
                }
                
                 if(arrDistans.length) {
                     
                    arrDistans.sort((a,b)=>a.distance - b.distance)
                    let distanceClone = arrDistans[0].vectorDirec.clone()
                    arrDistans[0].vectorDirec.setLength(3-arrDistans[0].distance)     // изменил длину вектора наплавление 
                    //let sub = arrDistans[0].vector.sub(distanceClone)// разницa
                    t.camera.position.sub(arrDistans[0].vectorDirec)
                 }
            }
        }


        if (cam2.checked) t.renderer.render(t.scene, t.camera2);
        else t.renderer.render(t.scene, t.camera);
        t.oldPosition.position.copy(t.camera.position.clone())
    }
}

