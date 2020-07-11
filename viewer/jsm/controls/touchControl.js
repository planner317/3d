// Управление с помощью сенсорного экрана сматрфона в браузере
// в цикле анимации кинуть update(run) run регулирует скорость от 0 - 1
import * as THREE from "../three.module.js";
export default function TouchControl(camera) {
console.log(import.meta);

    let t = this;
    //////////// области для сенсорного экрана
    this.domH = document.createElement("div")
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

    t.v3 = new THREE.Vector3() /// это координаты куда должена смотеть камера 

    t.speed = 0.75;      // чувствительность
    this.speedPosition = 1 // скорость перемещения

    t.lookActiv = false;    // флаг если палец перемещается по области look
    // DOM элементы точка где было нажатие на экран
    t.sizePoint; // размер точки
    t.pointV = createElement("#8008")
    t.pointH = createElement("#0808")
    // массив для фильтрации поворота
    t.filterLookX = Array(10); t.filterLookX.fill(0)
    t.filterLookY = Array(10); t.filterLookY.fill(0)

    t.domH.ontouchstart = t.domV.ontouchstart = t.domLook.ontouchstart = touchstart;
    t.domH.ontouchmove = t.domV.ontouchmove = t.domLook.ontouchmove = touchmove;
    t.domH.ontouchend = t.domV.ontouchend = t.domLook.ontouchend = touchend;

    //////////////////////// СОБЫТИЕ НА НАЖАТИЕ ПО СЕНСОРНОМУ ЭКРАНУ ////////////////////////////
    function touchstart(e) {
        e.preventDefault();

        for (let i = 0; i < e.changedTouches.length; i++) {

            let s = e.changedTouches[i]

            if (s.target == t.domH) {
                t.startXYH.x = s.clientX;                   // записывает начальные позии
                t.startXYH.y = s.clientY;
                t.pointH.style.top = s.clientY - t.sizePoint / 2 + "px"     // перемешет точку в эту позицию
                t.pointH.style.left = s.clientX - t.sizePoint / 2 + "px"
                t.pointH.style.transform = `scale(0)`
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
                t.pointV.style.top = s.clientY - t.sizePoint / 2 + "px"
                t.pointV.style.left = s.clientX - t.sizePoint / 2 + "px"
                t.pointV.style.transform = `scale(0)`
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
                t.offsetXYH.x = (m.clientX - t.startXYH.x) / 100 * t.speed
                t.offsetXYH.x = Math.min(Math.max(-2, t.offsetXYH.x), 2);

                t.offsetXYV.y = (m.clientY - t.startXYV.y) / 100 * t.speed
                t.offsetXYV.y = Math.min(Math.max(-2, t.offsetXYV.y), 2);

                t.pointV.style.transform = `scale(` + Math.max(Math.abs(t.offsetXYH.x), Math.abs(t.offsetXYV.y)) + `)`
                t.offsetXYH.x = (m.clientX - t.startXYH.x) / 100 * t.speed
            }
            if (m.target == t.domH) {
                t.offsetXYH.x = (m.clientX - t.startXYH.x) / 100 * t.speed
                t.offsetXYH.x = Math.min(Math.max(-2, t.offsetXYH.x), 2);

                t.offsetXYH.y = (m.clientY - t.startXYH.y) / 100 * t.speed
                t.offsetXYH.y = Math.min(Math.max(-2, t.offsetXYH.y), 2);

                t.pointH.style.transform = `scale(` + Math.max(Math.abs(t.offsetXYH.x), Math.abs(t.offsetXYH.y)) + `)`
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

    t.update = function (run = 1) {
        //--------------------------- ВРАЩЕНИЕ --------------------
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
        ///////////////////// отфильтрованые значение отклонение пальца от предыдущей позиции
        t.orientation.x -= fx * t.speed
        t.orientation.y -= fy * t.speed
        ////////////////////  ограничение x y по градусам
        if (t.orientation.y > 179.9) t.orientation.y = 179.9
        if (t.orientation.y < 0.1) t.orientation.y = 0.1
        /////////////////// передов в радианы 
        t.euler.y = THREE.MathUtils.degToRad(t.orientation.x)
        t.euler.x = THREE.MathUtils.degToRad(t.orientation.y - 90)
        camera.quaternion.setFromEuler(t.euler);

        // ------------------------ ПЕРЕМЕЩЕНИЕ ---------------------------

        //  встает на один по X относительно локальной координаты камеры то есть чуть дальше куда смотрит камера это направление вперед
        t.v3.setFromMatrixColumn(camera.matrix, 0);
        // приплюсовывает в направление v3
        camera.position.addScaledVector(t.v3, t.offsetXYH.x * run * t.speedPosition);
        // перекручивает положение вектора v3 по оси Y
        t.v3.crossVectors(camera.up, t.v3);
        // еще раз приплюсовывает теперь в другую сторону
        camera.position.addScaledVector(t.v3, -t.offsetXYH.y * run * t.speedPosition);

        camera.position.y += -t.offsetXYV.y * run * t.speedPosition// подъем или спуск здесь все просто
    }

    /////////////////////////////// создать круглый элемент
    function createElement(color) {
        let element = document.createElement("div")
        element.style.backgroundColor = color;
        element.style.borderRadius = "100px";
        element.style.transformOrigin = "center"
        size(element);
        element.style.visibility = "hidden";
        document.body.prepend(element);
        return element
    }

    function size(element) {
        t.sizePoint = (window.innerHeight + window.innerWidth) / 20
        element.style.width = t.sizePoint + "px"
        element.style.height = t.sizePoint + "px"
        element.style.position = "fixed"
        //element.style.transform = `translate(-${size / 2}px, -${size / 2}px)`;
    }

    window.addEventListener("resize", () => {
        size(t.pointV)
        size(t.pointH)
    })
    ///////////////////////////////////////////////////////// скрыть области навигации
    window.addEventListener("touchstart",hideInterfice) 
    window.addEventListener("click", hideInterfice);
    function hideInterfice() {
        t.domLook.style.background = 0
        t.domLook.innerText = ""
        t.domV.style.background = 0
        t.domV.innerText = ""
        t.domH.style.background = 0
        t.domH.innerText = ""
        t.domH.style.top = 0;
        t.domH.style.height = "100%";
        window.removeEventListener("touchstart", hideInterfice)
        window.removeEventListener("click", hideInterfice)
    }
}
