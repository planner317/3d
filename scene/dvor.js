let ddd = new Ddd()
ddd.animate();

//////////////////////// менюшка ///////////////////////
menuView.onclick=(e)=>{
    e.stopPropagation()
    e.preventDefault();
    if (menu.style.visibility == "visible") menu.style.visibility = "hidden"
    else menu.style.visibility = "visible"
}
menu.onclick=(e)=>{
    e.stopPropagation()
    //e.preventDefault();
}
full.onclick=()=>{
    if (document.fullscreen) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
}
speedSet.oninput=()=>{
    speedView.innerText="чувствительность сенсора " + speedSet.value;
    ddd.touchControl.speed = speedSet.value
}

window.addEventListener("mousedown", hideInfo)
window.addEventListener("touchstart", hideInfo)

function hideInfo(e){
    info.remove();
    window.removeEventListener("mousedown",hideInfo)
    window.removeEventListener("touchstart",hideInfo)
}

fps.onchange = ()=> {if (fps.checked) ddd.stats.setMode(0); else ddd.stats.setMode(); return false} 

//////////////////////// 3d пространство
function Ddd() {
    let t = this
    t.scene = new THREE.Scene();
    t.scene.background = new THREE.Color(0x223344)

    t.renderer = new THREE.WebGLRenderer({ antialias: true });
    t.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.append(t.renderer.domElement);

    t.ambientLight = new THREE.AmbientLight(0xffffff);
    t.ambientLight.intensity=1.5;
    t.scene.add(t.ambientLight);

    t.stats = new Stats()
    t.stats.setMode()
    document.body.append(t.stats.dom);

    t.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    t.camera.position.y=50;

    // движение мышкой в режиме pointerLock и движение клавой
    t.pointerLook = new THREE.MouseAndKeyboardControlsFirstPerson(t.camera, t.renderer.domElement);

    // уравление камерой с помощью сенсорного экрана, кидаем только камеру области для нажатия создает сам
    t.touchControl = new TouchControl(t.camera); 

    t.mode; // режим упарвление сенсором или клавиатурой с мышкой

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            download.style.lineHeight = window.innerHeight/1.5 +"px";
            download.innerHTML = `загрузка ${Math.round(percentComplete, 2)}%`;
        }
    };

    var onError = function () { };

    var manager = new THREE.LoadingManager();

    ///////////////////////
    new THREE.MTLLoader(manager)
        .setPath('model/dvor/')
        .load('dvor.mtl', function (materials) { // callmback функция вызывается после загрузки

            materials.preload();

            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath('model/dvor/')
                .load('dvor.obj', function (object) {
                    t.dvor = object
                    t.scene.add(object)
                    download.remove()
                }, onProgress, onError);
        });


    t.onWinResize = () => {
        t.camera.aspect = window.innerWidth / window.innerHeight;
        t.camera.updateProjectionMatrix();
        t.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', t.onWinResize, false);

    window.addEventListener("touchstart", ()=> t.mode = "sensor");

    t.animate = () => {

        requestAnimationFrame(t.animate);

       if (t.mode == "sensor") t.touchControl.update();
       else t.pointerLook.update()

       if (fps.checked) t.stats.update();

        t.renderer.render(t.scene, t.camera);

    }
}

