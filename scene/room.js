

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
    t.camera.position.y = 25;
    /////////////////////////////  коллизия
    var geometry = new THREE.SphereGeometry(5, 5, 6)
    var wireMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    t.colliz = new THREE.Mesh(geometry, wireMaterial);
    //t.scene.add(t.colliz)

    t.ray = new THREE.Raycaster();
    t.ray.far=10

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
        .load('room.mtl', function (materials) { // callmback функция вызывается после загрузки

            materials.preload();

            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath('model/room/')
                .load('room.obj', function (object) {
                    t.room = object
                    t.room.children[8].material.visible=false
                    t.mirrorRoom = new THREE.Object3D();
                    t.mirrorRoom.copy(t.room);
                    t.mirrorRoom.scale.x = -1
                    t.mirrorRoom.position.x = -105.4
                    t.scene.add(object)
                    t.scene.add(t.mirrorRoom)
                    download.remove()
                    t.colizMesh=[t.room.children[8],t.mirrorRoom.children[8]]
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

            if (t.mode == "sensor") t.touchControl.update();
            else t.pointerLook.update()

            if (menu.style.visibility == "visible") t.stats.update();

            t.colliz.position.x = t.camera.position.x
            t.colliz.position.y = t.camera.position.y
            t.colliz.position.z = t.camera.position.z

            for (var vertexIndex = 0; vertexIndex < t.colliz.geometry.vertices.length; vertexIndex++) {
                var localVertex = t.colliz.geometry.vertices[vertexIndex];

                t.ray.ray.origin=t.camera.position
                t.ray.ray.direction=localVertex
                var collisionResults = t.ray.intersectObjects(t.colizMesh);
                if (collisionResults.length){

                    if (collisionResults[0].distance < 5) {
                        t.camera.position.x -= localVertex.x / collisionResults[0].distance
                        t.camera.position.y -= localVertex.y / collisionResults[0].distance
                        t.camera.position.z -= localVertex.z / collisionResults[0].distance
                        
                    }
                }
            }
        }

        t.renderer.render(t.scene, t.camera);

    }
}

