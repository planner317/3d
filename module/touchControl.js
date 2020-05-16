
let logStatus1 = document.getElementById("logStatus1");

function TouchControl(domLift, domMove, domLook, camera) {

    let t = this;
    ///// начальные координаты на сенсорном экране
    t.startXYLift = { y: 0 };
    t.startXYMove = { x: 0, y: 0 };
    t.startXYLook = { x: 0, y: 0 };
    ///////////////////////////////// смещение относитьельно старта или предидущей позции у look
    t.offsetXYLift = { y: 0 };
    t.offsetXYMove = { x: 0, y: 0 };
    t.offsetXYLook = { x: 0, y: 0 };
    ////////////////////////////////// ориентация (поворот  в градусах 0 вниз 180 ввех смотрит)
    t.orientation = { x: 0, y: 90 };
    ////////////////////////////////// объект в который помещиается камера и v3 ( нажен для движения отностельно пола )
    t.box = new THREE.Object3D()
    ////////////////////////////////// это координаты куда должена смотеть камера
    t.v3 = new THREE.Vector3()

    t.box.add(camera)
    t.speed=0.4;      // чувствительность

    t.lookMoved = false;    // флаг если палец перемещается по области look

    domMove.ontouchstart = domLift.ontouchstart = domLook.ontouchstart = touchstart;
    domMove.ontouchmove = domLift.ontouchmove = domLook.ontouchmove = touchmove;
    domLift.ontouchend = domMove.ontouchend = touchend;

    function touchstart(e) {
        e.preventDefault();
        //log2.innerHTML += "start<br>"

        for (let i = 0; i < e.changedTouches.length; i++) {

            let s = e.changedTouches[i]

            if (s.target.id == "lift") {
                t.startXYMove.x = s.clientX;
                t.startXYLift.y = s.clientY;
            }
            if (s.target.id == "move") {
                t.startXYMove.x = s.clientX;
                t.startXYMove.y = s.clientY;
            }
            if (s.target.id == "look") {
                t.startXYLook.x = s.clientX;
                t.startXYLook.y = s.clientY;
            }
        }
    }
    function touchmove(e) {
        e.preventDefault();
        // logStatus1.innerHTML = "move<br>"

        for (let i = 0; i < e.changedTouches.length; i++) {
            let a = e.changedTouches[i];

            if (a.target.id == "lift") {
                t.offsetXYMove.x = a.clientX - t.startXYMove.x
                t.offsetXYLift.y = a.clientY - t.startXYLift.y
            }
            if (a.target.id == "move") {
                t.offsetXYMove.x = a.clientX - t.startXYMove.x
                t.offsetXYMove.y = a.clientY - t.startXYMove.y
            }
            if (a.target.id == "look") {
                if (t.startXYLook.x == a.clientX && t.startXYLook.y == a.clientY) continue;
                t.offsetXYLook.x = a.clientX - t.startXYLook.x;
                t.offsetXYLook.y = a.clientY - t.startXYLook.y;

                t.startXYLook.x = a.clientX
                t.startXYLook.y = a.clientY
                t.lookMoved = true;

            }
        }
    }

    function touchend(e) {
        e.preventDefault();
        //log2.innerHTML += "end<br>"
        let lift = 0;
        let move = 0;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].target.id == "lift") lift++;
            if (e.touches[i].target.id == "move") move++;
        }

        if (!lift) t.offsetXYLift.y = t.offsetXYMove.x = 0;
        if (!move) t.offsetXYMove.x = t.offsetXYMove.y = 0;
    }

    t.update = function () {

        if (!t.lookMoved) { // если движение по области look не было
            t.offsetXYLook.x = 0
            t.offsetXYLook.y = 0
        }
        t.lookMoved = false;

        t.orientation.x += t.offsetXYLook.x * t.speed
        t.orientation.y -= t.offsetXYLook.y * t.speed

        if (t.orientation.y > 179.9) t.orientation.y = 179.9
        if (t.orientation.y < 0.1) t.orientation.y = 0.1

        ///////////////////////// при каждом вызове перемещает box в котором камера на offsetXYMove
        t.box.rotation.y = THREE.MathUtils.degToRad(t.orientation.x) 
        
        t.box.translateZ(-t.offsetXYMove.y * t.speed / 100)
        t.box.translateX(-t.offsetXYMove.x * t.speed / 100)
        
        t.box.translateY(-t.offsetXYLift.y * t.speed / 100)
        
        t.v3.setFromSphericalCoords(1, THREE.MathUtils.degToRad(t.orientation.y), THREE.MathUtils.degToRad(t.orientation.x)).add(t.box.position)
        camera.lookAt(t.v3)

    }
}
