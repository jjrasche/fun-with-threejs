window.threeDEnvironment = function (container) {
	var size = 1000, step = 10;
	// var container, stats;
	var camera, controls, scene;
	renderer = null
	var rotating = false, dragging = false;
	var objects = [];
	var delta = 10;
	var gridHelper;
	var plane = new THREE.Plane();
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var mouse2 = new THREE.Vector2();
	var mouse3 = new THREE.Vector2();
	var offset = new THREE.Vector3();
	var intersection = new THREE.Vector3();
	var INTERSECTED; 
	var selectedObject = null;
	var brightenAmount = 1.5;
	var previousMousePosition = { x: 0, y: 0 };


// browser interaction
	var onWindowResize = function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	};

	var onDocumentMouseMove = function onDocumentMouseMove( event ) {

		event.preventDefault();

		var m2 = {};
		mouse2.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse2.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		// // console.log(event, m2, mouse);
		mouse.x = ( ( event.clientX - (renderer.domElement.offsetLeft + renderer.domElement.offsetParent.offsetLeft )) / renderer.domElement.width ) * 2 - 1;
		mouse.y = - ( ( event.clientY - (renderer.domElement.offsetTop + renderer.domElement.offsetParent.offsetTop)) / renderer.domElement.height ) * 2 + 1;

		mouse3.x = ( ( event.clientX - container.offsetLeft ) / container.clientWidth ) * 2 - 1;
		mouse3.y = - ( ( event.clientY - container.offsetTop ) / container.clientHeight ) * 2 + 1;

		raycaster.setFromCamera( mouse, camera );


		if (selectedObject) {
			if (rotating) {
				var deltaMove = {
			        x: event.offsetX-previousMousePosition.x,
			        y: event.offsetY-previousMousePosition.y
			    };

		        var deltaRotationQuaternion = new THREE.Quaternion()
		            .setFromEuler(new THREE.Euler(
		                toRadians(deltaMove.y * 1),
		                toRadians(deltaMove.x * 1),
		                0,
		                'XYZ'
		            ));
		        
		        selectedObject.quaternion.multiplyQuaternions(deltaRotationQuaternion, selectedObject.quaternion);
			    
			    previousMousePosition = {
			        x: event.offsetX,
			        y: event.offsetY
			    };
			}
			else if (dragging) {
				if ( selectedObject ) {
					if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
						selectedObject.position.copy( intersection.sub( offset ) );
					}
					return;
				}
			}
		}
	}

	var onDocumentMouseDown = function onDocumentMouseDown( event ) {
		event.preventDefault();
		console.log(event, renderer.domElement, container, mouse, mouse2, mouse3);

		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( objects );
		if (rotating) {
			rotating = false;
			return;
		}				
		if ( intersects.length > 0) {
			// unselect already selectedObject
			if (selectedObject) selectedObject.unHighlight();
			if (dragging) dragging = false;

			controls.enabled = false;
			selectedObject = intersects[0].object;
			selectedObject.highlight(brightenAmount);

			if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
				offset.copy( intersection ).sub( selectedObject.position );
			}
			container.style.cursor = 'move';
		}
		else {
			if (selectedObject) {
				selectedObject.unHighlight();
				console.log('nulling selectedObject', selectedObject);
				selectedObject = null;
				console.log('selectedObject nulled', selectedObject);
			}
		}
	}

	var onDocumentMouseUp = function onDocumentMouseUp( event ) {
		event.preventDefault();
		controls.enabled = true;
		container.style.cursor = 'auto';
	}

	// misc functions
	var toFrontView = function toFrontView() {
		controls.reset();
		camera.position.set(0,0,farthestDistanceFromOrigin(camera));
	}
	var toSideView = function toSideView() {
		controls.reset();
		camera.position.set(farthestDistanceFromOrigin(camera),0,0);
	}
	var toTopView = function toTopView() {
		controls.reset();
		camera.position.set(0,farthestDistanceFromOrigin(camera),0);
	}

	var farthestDistanceFromOrigin = function farthestDistanceFromOrigin(camera) {
		var ret = 0;
		if (camera.position.x > ret)
			ret = camera.position.x; 
		if (camera.position.y > ret)
			ret = camera.position.y;
		if (camera.position.z > ret)
			ret = camera.position.z;  
		return ret;				
	}

	var toRadians = function toRadians(angle) {
		return angle * (Math.PI / 180);
	}

	var toDegrees = function toDegrees(angle) {
		return angle * (180 / Math.PI);
	}

	function init() {

		document.addEventListener('keydown',onDocumentKeyDown,false);
		function onDocumentKeyDown(event){
			event = event || window.event;

			switch(event.key){
				case 'ArrowUp' :
					if (selectedObject) {
						selectedObject.position.y += delta;
					}
					camera.position.y = camera.position.y + delta;
					break;
				case 'ArrowDown' :
					if (selectedObject) {
						selectedObject.position.y -= delta;
					}
					camera.position.y = camera.position.y - delta;
					break;
				case 'ArrowRight' :
					if (selectedObject) {
						selectedObject.position.x += delta;
					}
					camera.position.x = camera.position.x + delta;
					break;
				case 'ArrowLeft' :
					if (selectedObject) {
						selectedObject.position.x -= delta;
					}
					camera.position.x = camera.position.x - delta;
					break;
				case 's' :
					if (selectedObject) {
						selectedObject.position.z += delta;
					}
					camera.position.z = camera.position.z + delta;
					break;
				case 'w' :
					if (selectedObject) {
						selectedObject.position.z -= delta;
					}
					camera.position.z = camera.position.z - delta;
					break;
				case 'r' :
					dragging = false;
					rotating = !rotating;
					break;
				case 'd' :
					rotating = false;
					dragging = !dragging;
					break;			
				case '1' :
					if (selectedObject) {
						selectedObject.removeRotationAroundAxis('z');
						console.log(selectedObject.rotation);
					}
					else
						toFrontView();
					break;
				case '2' :
					if (selectedObject) {
						selectedObject.removeRotationAroundAxis('x');
						console.log(selectedObject.rotation);
					}
					else
						toSideView();
					break;
				case '3' :
					if (selectedObject) {
						selectedObject.removeRotationAroundAxis('y');
						console.log(selectedObject.rotation);
					}
					else
						toTopView();
					break;
			}

		}

		camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
		camera.position.x = 1000;
		camera.position.y = 1000;
		camera.position.z = 1000;


		controls = new THREE.TrackballControls( camera );
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;
		controls.noZoom = false;
		controls.noPan = false;
		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;

		scene = new THREE.Scene();

		scene.add( new THREE.AmbientLight( 0xf0f0f0 ) );



		gridHelper = new THREE.GridHelper(size, step, 0x000000, 0xff0000);
		scene.add( gridHelper );

		var geometry = new THREE.BoxGeometry( 40, 40, 40 );

		// create object
		var xobj = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xa00000 } ) );
		xobj.position.x = 200;
		xobj.position.y = 0;
		xobj.position.z = 0;

		xobj.rotation.x = 0;
		xobj.rotation.y = 0;
		xobj.rotation.z = 0;

		xobj.scale.x = 1;
		xobj.scale.y = 1;
		xobj.scale.z = 1;

		scene.add(xobj);
		objects.push(xobj);

		var yobj = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x00a000 } ) );
		yobj.position.x = 0;
		yobj.position.y = 200;
		yobj.position.z = 0;

		yobj.rotation.x = 0;
		yobj.rotation.y = 0;
		yobj.rotation.z = 0;

		yobj.scale.x = 1;
		yobj.scale.y = 1;
		yobj.scale.z = 1;

		scene.add(yobj);
		objects.push(yobj);

		var zobj = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x0000a0 } ) );
		zobj.position.x = 0;
		zobj.position.y = 0;
		zobj.position.z = 200;

		zobj.rotation.x = 0;
		zobj.rotation.y = 0;
		zobj.rotation.z = 0;

		zobj.scale.x = 1;
		zobj.scale.y = 1;
		zobj.scale.z = 1;

		scene.add(zobj);
		objects.push(zobj);

		var obj = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0x888888 } ) );
		obj.position.x = 0;
		obj.position.y = 0;
		obj.position.z = 10;

		obj.rotation.x = 45;
		obj.rotation.y = 45;
		obj.rotation.z = 45;

		obj.scale.x = 1;
		obj.scale.y = 1;
		obj.scale.z = 1;

		scene.add(obj);
		objects.push(obj);


		renderer = new THREE.WebGLRenderer( { antialias: true} );
		renderer.setClearColor( 0xf0f0f0 );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.sortObjects = false;

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;

		container.appendChild( renderer.domElement );

		renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

		window.addEventListener( 'resize', onWindowResize, false );
	}

	var render = function() {
		controls.update();
		renderer.render( scene, camera );
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
	}

	init();
	animate();
}
