
THREE.MouseAndKeyboardControlsFirstPerson = function (camera, domElement) {

	if (domElement === undefined) {

		console.warn('THREE.MouseAndKeyboardControlsFirstPerson: The second parameter "domElement" is now mandatory.');
		domElement = document.body;

	}
	var scope = this;

	this.domElement = domElement;
	this.isLocked = false;
	this.moveX = 0
	this.moveY = 0
	this.moveZ = 0

	scope.filterX = Array(10)
	scope.filterY = Array(10)
	scope.filterZ = Array(10)

	scope.speed = 1

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new THREE.Euler(0, 0, 0, 'YXZ');

	var PI_2 = Math.PI / 2;

	var vec = new THREE.Vector3();

	///////////////////////////// ССОБИТЕ НАЖАТИЕ НА КНОПКИ WASD ВЕРХ ВНИЗ ЛЕВО ПРАВО
	function onKeyDown(event) {

		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				scope.moveZ = 1;
				break;

			case 37: // left
			case 65: // a
				scope.moveX = -1;
				break;

			case 40: // down
			case 83: // s
				scope.moveZ = -1;
				break;

			case 39: // right
			case 68: // d
				scope.moveX = 1;
				break;

			case 69: // e // up
				scope.moveY = 1;
				break;

			case 67: // c // down
				scope.moveY = -1;
				break;

			case 16: // shift
				scope.speed = 2;
				break;
		}
	};

	function onKeyUp(event) {

		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				scope.moveZ = 0;
				break;

			case 37: // left
			case 65: // a
				scope.moveX = 0;
				break;

			case 40: // down
			case 83: // s
				scope.moveZ = 0;
				break;

			case 39: // right
			case 68: // d
				scope.moveX = 0;
				break;

			case 69: // e // up
				scope.moveY = 0;
				break;

			case 67: // c // down
				scope.moveY = 0;
				break;

			case 16: // shift
				scope.speed = 1;
				break;
		}
	}



	function onMouseMove(event) {

		if (scope.isLocked === false) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion(camera.quaternion);

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max(- PI_2, Math.min(PI_2, euler.x));

		camera.quaternion.setFromEuler(euler);

		scope.dispatchEvent(changeEvent);

	}

	function onPointerlockChange() {

		if (document.pointerLockElement === scope.domElement) {

			scope.dispatchEvent(lockEvent);

			scope.isLocked = true;

		} else {

			scope.dispatchEvent(unlockEvent);

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error('THREE.MouseAndKeyboardControlsFirstPerson: Unable to use Pointer Lock API');

	}

	this.connect = function () {

		document.addEventListener('mousemove', onMouseMove, false);
		document.addEventListener('pointerlockchange', onPointerlockChange, false);
		document.addEventListener('pointerlockerror', onPointerlockError, false);
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
		document.addEventListener('click', () => scope.lock(), false);

	};

	this.disconnect = function () {

		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('pointerlockchange', onPointerlockChange, false);
		document.removeEventListener('pointerlockerror', onPointerlockError, false);
		document.removeEventListener('keydown', onKeyDown, false);
		document.removeEventListener('keyup', onKeyUp, false);

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new THREE.Vector3(0, 0, - 1);

		return function (v) {

			return v.copy(direction).applyQuaternion(camera.quaternion);

		};

	}();

	this.moveForward = function (distance) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		vec.setFromMatrixColumn(camera.matrix, 0);

		vec.crossVectors(camera.up, vec);

		camera.position.addScaledVector(vec, distance);

	};

	this.moveRight = function (distance) {

		vec.setFromMatrixColumn(camera.matrix, 0);

		camera.position.addScaledVector(vec, distance);

	};

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.update = function () {
		////////////////////// фильтрация средее арифметическое из 10 последних 
		scope.filterX.push(scope.moveX); scope.filterX.shift();
		scope.filterY.push(scope.moveY); scope.filterY.shift();
		scope.filterZ.push(scope.moveZ); scope.filterZ.shift();

		let fx = scope.filterX.reduce((a, b) => (a + b)) / 10
		let fy = scope.filterY.reduce((a, b) => (a + b)) / 10
		let fz = scope.filterZ.reduce((a, b) => (a + b)) / 10

		this.moveForward(fz * scope.speed)
		this.moveRight(fx * scope.speed)
		camera.position.y += fy * scope.speed
	}

	this.connect();

};

THREE.MouseAndKeyboardControlsFirstPerson.prototype = Object.create(THREE.EventDispatcher.prototype);
THREE.MouseAndKeyboardControlsFirstPerson.prototype.constructor = THREE.MouseAndKeyboardControlsFirstPerson;
