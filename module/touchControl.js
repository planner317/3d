// Управление с помощью сенсорного экрана сматрфона в браузере
// в цикле анимации кинуть update()

function TouchControl(camera) {

    let t = this;
    //////////// области для сенсорного экрана
    t.domH = document.createElement("div")
    t.domH.style = `position: fixed; left: 0;top: 50%; width: 50%;text-align: center;height: 50%; overflow: hidden;background-color: #060a;`
    t.domH.innerHTML = `<h2>область сенсорного экрана</h2>движение вперед назад влево вправо`
    document.body.append(t.domH);

    t.domLook = document.createElement("div")
    t.domLook.style = `position: fixed; left: 50%;top: 0; width: 50%; text-align: center; height: 100%; overflow: hidden; background-color: #006a;`
    t.domLook.innerHTML = `<h2>область сенсорного экрана</h2> поворот камеры вокруг своей оси`
    document.body.append(t.domLook);

    t.domV = document.createElement("div")
    t.domV.style = `position: fixed; left: 0; top: 0; width: 50%; text-align: center; height: 50%; overflow: hidden; background-color: #600a;`
    t.domV.innerHTML = `<h2>область сенсорного экрана</h2> движение вверх вниз влево вправо`
    document.body.append(t.domV);

    ///// начальные координаты на сенсорном экране
    t.startXYV = { y: 0 };
    t.startXYH = { x: 0, y: 0 };
    t.startXYLook = { x: 0, y: 0 };
    ///////////////////////////////// смещение относитьельно старта или предидущей позции у look
    t.offsetXYV = { y: 0 };
    t.offsetXYH = { x: 0, y: 0 };
    t.offsetXYLook = { x: 0, y: 0 };
    ////////////////////////////////// ориентация (поворот  в градусах 0 вниз 180 ввех смотрит)
    t.orientation = { x: 0, y: 90 };
    t.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    ////////////////////////////////// это координаты куда должена смотеть камера
    t.v3 = new THREE.Vector3()

    t.speed = 0.75;      // чувствительность

    t.lookActiv = false;    // флаг если палец перемещается по области look
    // DOM элементы точка где было нажатие на экран
    t.pointV = createElement("#8008")
    t.pointH = createElement("#0808")
    // массив для фильтрации поворота
    t.filterLookX = Array(10); t.filterLookX.fill(0)
    t.filterLookY = Array(10); t.filterLookY.fill(0)

    t.domH.ontouchstart = t.domV.ontouchstart = t.domLook.ontouchstart = touchstart;
    t.domH.ontouchmove = t.domV.ontouchmove = t.domLook.ontouchmove = touchmove;
    t.domH.ontouchend = t.domV.ontouchend = t.domLook.ontouchend = touchend;

    //////////////////////// СОБЫТИЕ НА ННАЖАТИЕ ПО СЕНСОРНОМУ ЭКРАНУ ////////////////////////////
    function touchstart(e) {
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {

            let s = e.changedTouches[i]

            if (s.target == t.domH) {
                t.startXYH.x = s.clientX;                   // записывает начальные позии
                t.startXYH.y = s.clientY;
                t.pointH.style.top = s.clientY + "px"     // перемешет точку в эту позицию
                t.pointH.style.left = s.clientX + "px"
                t.pointH.style.visibility = "visible"
                t.domH.style.visibility = "hidden"        // скрывает свою область чтобы 2-й раз не нажать
                t.domLook.style.width = "100%"            // расширяет область просмотра на свою территорию
                t.domLook.style.left = 0;
            }
            if (s.target == t.domLook) {
                t.startXYLook.x = s.clientX;
                t.startXYLook.y = s.clientY;
                t.domLook.style.visibility = "hidden"
                t.domH.style.width = "100%"
            }
            if (s.target == t.domV) {
                t.startXYH.x = s.clientX;
                t.startXYV.y = s.clientY;
                t.pointV.style.top = s.clientY + "px"
                t.pointV.style.left = s.clientX + "px"
                t.pointV.style.visibility = "visible"
                t.domV.style.visibility = "hidden"
            }
        }
    }
    function touchmove(e) {
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {
            let m = e.changedTouches[i];

            if (m.target == t.domV) {
                t.offsetXYH.x = m.clientX - t.startXYH.x
                t.offsetXYV.y = m.clientY - t.startXYV.y
            }
            if (m.target == t.domH) {
                t.offsetXYH.x = m.clientX - t.startXYH.x
                t.offsetXYH.y = m.clientY - t.startXYH.y
            }
            if (m.target == t.domLook) {
                if (t.startXYLook.x == m.clientX && t.startXYLook.y == m.clientY) continue; //глюк
                t.offsetXYLook.x = m.clientX - t.startXYLook.x;
                t.offsetXYLook.y = m.clientY - t.startXYLook.y;

                t.startXYLook.x = m.clientX
                t.startXYLook.y = m.clientY
                t.lookActiv = true;
            }
        }
    }

    function touchend(e) {
        e.preventDefault();

        let v = 0;
        let h = 0;
        let look = 0;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].target == t.domV) v++;
            if (e.touches[i].target == t.domH) h++;
            if (e.touches[i].target == t.domLook) look++;
        }

        if (!v) {
            t.offsetXYV.y = t.offsetXYH.x = 0;
            t.pointV.style.visibility = "hidden";
            t.domV.style.visibility = "visible"
        }
        if (!h) {
            t.offsetXYH.x = t.offsetXYH.y = 0;
            t.pointH.style.visibility = "hidden";
            t.domH.style.visibility = "visible"
            t.domLook.style.width = "50%"
            t.domLook.style.left = "50%"
        }
        if (!look) {
            t.domLook.style.visibility = "visible"
            t.domH.style.width = "50%"
        }
    }

    t.update = function (run=1) {

        if (!t.lookActiv) { // если движение по области look не было
            t.offsetXYLook.x = 0
            t.offsetXYLook.y = 0
        }
        t.lookActiv = false;
        ////////////////////// фильтрация средее арифметическое из 10 последних 
        t.filterLookX.push(t.offsetXYLook.x); t.filterLookX.shift();
        t.filterLookY.push(t.offsetXYLook.y); t.filterLookY.shift();
        let fx = t.filterLookX.reduce((a, b) => (a + b)) / t.filterLookX.length;
        let fy = t.filterLookY.reduce((a, b) => (a + b)) / t.filterLookY.length;

        t.orientation.x -= fx * t.speed
        t.orientation.y -= fy * t.speed

        if (t.orientation.y > 179.9) t.orientation.y = 179.9
        if (t.orientation.y < 0.1) t.orientation.y = 0.1

        t.euler.setFromQuaternion(camera.quaternion);
        t.euler.y = THREE.MathUtils.degToRad(t.orientation.x * t.speed)
        t.euler.x = THREE.MathUtils.degToRad((t.orientation.y - 90) * t.speed)

        //////////////////////////////////// добавить чувствительность и коэфицент run
        t.offsetXYH.x *= t.speed / 100 * run
        t.offsetXYH.y *= t.speed / 100 * run
        t.offsetXYV.y *= t.speed / 100 * run
        //////ограничитель смещения до 2-х
        t.offsetXYH.x = Math.min(Math.max(-2, t.offsetXYH.x), 2);
        t.offsetXYH.y = Math.min(Math.max(-2, t.offsetXYH.y), 2);
        t.offsetXYV.y = Math.min(Math.max(-2, t.offsetXYV.y), 2);
        //  вроде встает на один по X или Z относительно локальной координаты камеры
        t.v3.setFromMatrixColumn(camera.matrix, 0);
        // приплюсоваывает координаты из v3 в камеру умноженую на 2-й агрумент(это смещение пальца на сенсоре * чувствительность)
        camera.position.addScaledVector(t.v3, t.offsetXYH.x);
        // перекручивает положение вектора v3 по оси Y
        t.v3.crossVectors(camera.up, t.v3);
        // еще раз приплюсовавает теперь в другую сторону
        camera.position.addScaledVector(t.v3, -t.offsetXYH.y);

        camera.position.y += -t.offsetXYV.y // подъем или спуск здесь все просто

        camera.quaternion.setFromEuler(t.euler);

    }
    /////////////////////////////// создать круглый элемент
    function createElement(color) {
        let element = document.createElement("div")
        element.style.backgroundColor = color;
        element.style.borderRadius = "100px";
        size(element);
        element.style.visibility = "hidden";
        document.body.prepend(element);
        return element
    }

    function size(element) {
        let size = (window.innerHeight + window.innerWidth) / 20
        element.style.width = size + "px"
        element.style.height = size + "px"
        element.style.position = "fixed"
        element.style.transform = `translate(-${size / 2}px, -${size / 2}px)`;
    }

    window.addEventListener("resize", () => {
        size(t.pointV)
        size(t.pointH)
    })
    window.ontouchstart = window.onclick = hideInterfice;
    function hideInterfice() {
        t.domLook.style.background = 0
        t.domLook.innerText = ""
        t.domV.style.background = 0
        t.domV.innerText = ""
        t.domH.style.background = 0
        t.domH.innerText = ""
        t.domH.style.top = 0;
        t.domH.style.height = "100%";
        window.ontouchstart = window.onclick = ""
    }
}
