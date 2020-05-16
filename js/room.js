
let ddd = new Ddd()
ddd.animate();

window.ontouchstart = window.onclick = hideInterfice;

menuView.onclick=()=>{
    if (menu.style.visibility == "visible") menu.style.visibility = "hidden"
    else menu.style.visibility = "visible"
}

full.onclick=()=>{
    if (document.fullscreen) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
}

speedSet.onchange=()=>{
    speedView.innerText="чувствительность " + speedSet.value;
    ddd.touchControl.speed = speedSet.value
}

function hideInterfice() {
    lift.style.background = ""
    move.style.background = ""
    look.style.background = ""
    window.ontouchstart = window.onclick = ""
}


function Ddd() {
    let t = this
    t.scene = new THREE.Scene();
    t.scene.background = new THREE.Color(0x223344)

    t.renderer = new THREE.WebGLRenderer({ antialias: true });
    t.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.append(t.renderer.domElement);

    t.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

    t.touchControl = new TouchControl(lift, move, look, t.camera);
    t.touchControl.box.position.y = 25
    // t.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    // t.scene.add(t.ambientLight);

    // let p = new THREE.PointLight(0xffffff, 1);
    // p.position.y = 550;
    // t.scene.add(p)

    // for (let index = 0; index < 1000; index++) {

    //     let mesh = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshPhongMaterial());

    //     mesh.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 500 - 250)
    //     t.scene.add(mesh)
    // }

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            log.innerHTML = ("загрузка" + Math.round(percentComplete, 2) + '%');
        }
    };

    var onError = function () { };

    var manager = new THREE.LoadingManager();

    ///////////////////////
    new THREE.MTLLoader(manager)
        .setPath('model/')
        .load('room.mtl', function (materials) {

            materials.preload();

            new THREE.OBJLoader(manager)
                .setMaterials(materials)
                .setPath('model/')
                .load('room.obj', function (object) {
                    t.room = object
                    t.scene.add(object)
                    log.innerHTML = "";
                }, onProgress, onError);
        });


    t.onWinResize = () => {
        t.camera.aspect = window.innerWidth / window.innerHeight;
        t.camera.updateProjectionMatrix();
        t.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', t.onWinResize, false);

    t.animate = () => {

        requestAnimationFrame(t.animate);

        // log.innerHTML = `
        // orY = ${t.touchControl.orientation.y}<br>
        // orX = ${t.touchControl.orientation.x}<br><br>
        // lift y= ${t.touchControl.offsetXYLift.y}<br><br>
        // move x= ${t.touchControl.offsetXYMove.x}<br> 
        // move y= ${t.touchControl.offsetXYMove.y}<br><br>
        // look x= ${t.touchControl.offsetXYLook.x}<br>
        // look y= ${t.touchControl.offsetXYLook.y}<br><br>
        // lookMoved = ${t.touchControl.lookMoved}
        // `;
        // if (log2.innerHTML.length >700) log2.innerHTML=""

        t.touchControl.update();
        t.renderer.render(t.scene, t.camera);

    }
}

