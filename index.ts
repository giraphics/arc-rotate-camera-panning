import * as BABYLON from '@babylonjs/core';
import 'babylonjs-loaders';
import Gui from './ui/gui';
import SimpleStore from './store/store';

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Couldn't find a canvas. Aborting the demo")

const engine = new BABYLON.Engine(canvas, true, {});
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 4, new BABYLON.Vector3(0, 0, 0), scene);
// let ratio = 1;
// let previousCameraRadius = 0;
let isPanning = false;
let lastPointerX :number = 0;
let lastPointerY :number = 0;
const xplane = BABYLON.Plane.FromPositionAndNormal(BABYLON.Vector3.Zero(), BABYLON.Axis.X);
const zplane = BABYLON.Plane.FromPositionAndNormal(BABYLON.Vector3.Zero(), BABYLON.Axis.Z);

const store = new SimpleStore();
const gui = new Gui(store, canvas, null, 1520, 640);
gui.setup();

function prepareScene() {
	// Camera
	camera.attachControl(canvas, true, false);
    // camera.wheelPrecision = 30;
    camera.minZ = 1;
    camera.maxZ = 10000;
    // // camera.setTarget(new Vector3(0, 0, 0));
    // camera.setPosition(new BABYLON.Vector3(10, 10.0, 0.0));
    // // let ct = camera.getForwardRay(60);
    // // camera.setTarget(ct.origin.add(ct.direction.scale(30)) );

    // // ct = ct.origin.add(ct.direction.scale(30)) 

    camera.upperBetaLimit = Math.PI / 2.5;
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 3000;
    // camera.zoomToMouseLocation = true;
    // //camera.position = new Vector3(100, 100, 100);
    // // camera.wheelDeltaPercentage = 1;
    // camera.panningInertia = 0;
    // //camera.mapPanning = false;
    camera.panningSensibility = 50;
    // //this.previousCameraRadius = camera.radius;


	// Light
	new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.5, 1, 0.8).normalize(), scene);

	// Make scene Dirty and Create Objects
	store.sceneDirty = true;
	store.applyBouncing(store.transformNode, store.animationAmplitude, store.animationDuration);
}

prepareScene();

engine.runRenderLoop(() => {
	// Update animation
	store.tween.update();

	if (store.sceneDirty) {
	  store.createBox('Box', scene, store.boxWidth, store.boxHeight, store.boxDepth);
	  store.createCylinder('Cylinder', scene, store.cylinderDiameter, store.cylinderHeight);
	  store.createGround('Ground1', scene, 10000, 10000);
	  store.createIcosphere('IcoSphere', scene, store.icoSphereDiameter, store.icoSphereSubdivisions);
	  store.sceneDirty = false;
	}

	// if (previousCameraRadius != camera.radius) {
	// 	ratio = previousCameraRadius / camera.radius;
	// 	previousCameraRadius = camera.radius;

	//    camera.panningSensibility *= ratio;
	// //     camera.wheelPrecision *= ratio;
	// // 	console.log(camera.wheelPrecision, camera.radius)
	// }
 
	scene.render();
  });
  

window.addEventListener("resize", () => {
  engine.resize();
})

const onPointerDown = function() {
  // Perform selection
  const pick = scene.pick(scene.pointerX, scene.pointerY, undefined, false, null, (p0: BABYLON.Vector3, p1: BABYLON.Vector3, p2: BABYLON.Vector3, ray) => {
	let p0p1 : BABYLON.DeepImmutable<BABYLON.Vector3> = p0.subtract(p1);
	const p2p1 : BABYLON.DeepImmutable<BABYLON.Vector3> = p2.subtract(p1);
	const normal = BABYLON.Vector3.Cross(p0p1 as Object as BABYLON.DeepImmutable<BABYLON.Vector3>, p2p1 as Object as BABYLON.DeepImmutable<BABYLON.Vector3>);
	return (BABYLON.Vector3.Dot(ray.direction as Object as BABYLON.Vector3, normal) < 0);
  });

  if (pick?.hit && store.currentSelection) {
	console.log(pick?.pickedMesh?.name);
	store.currentSelectionName = pick?.pickedMesh?.name;

	// unset old selection transform node
	store.currentSelection.parent = null;
	
	if (pick?.pickedMesh?.name == store.boxName ) {
	  store.currentSelection = store.box;
	  store.isGuiDirty = true;
	}
	else if (pick?.pickedMesh?.name == store.icoSphereName) {
	  store.currentSelection = store.icosphere;
	  store.isGuiDirty = true;
	}
	else if (pick?.pickedMesh?.name == store.cylinderName){
	  store.currentSelection = store.cylinder;
	  store.isGuiDirty = true;
	}

	// Set new selection's tranform node.
	if (store.currentSelection) {
	  store.currentSelection.parent = store.transformNode;
	}
  }
};

scene.onPrePointerObservable.add(onPointerDown, BABYLON.PointerEventTypes.POINTERDOWN);

const onPointerDownNew = function() {
    var rayX = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera, false);
	if(store.ground){
    	
        const hitInfo = rayX.intersectsMesh(store.ground);

        if(hitInfo && hitInfo.hit && hitInfo.pickedPoint){
            //console.log(hitInfo.pickedPoint);
            store.icosphere?.setEnabled(true);
			isPanning = true;
			
            // store.icosphere?.position.copyFromFloats(hitInfo.pickedPoint?.x, 0, hitInfo.pickedPoint?.z);
            // store.icosphere?.position.copyFromFloats(store.icosphere?.position.x + hitInfo.pickedPoint?.x, 0, hitInfo.pickedPoint?.z);
			lastPointerX = hitInfo.pickedPoint?.x;
			lastPointerY = hitInfo.pickedPoint?.z;
        }else{
            store.icosphere?.setEnabled(true);
        }
	}

	return;
    const distanceX = rayX.intersectsPlane(xplane);
	var rayZ = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera, false);
    const distanceZ = rayZ.intersectsPlane(zplane);

	console.log('rt: ' + distanceX + ', ' + distanceZ);
	return;
	/////////////////////////////////////////////////////////
	// console.log('Point down: ' + scene.pointerX + ', ' + scene.pointerY);
	const pick = scene.pick(scene.pointerX, scene.pointerY, undefined, false, null, (p0, p1, p2, ray) => {
		var p0p1 = p0.subtract(p1);
		var p2p1 = p2.subtract(p1);
		var normal = BABYLON.Vector3.Cross(p0p1, p2p1);
		return (BABYLON.Vector3.Dot(ray.direction, normal) < 0);
	});

	if (pick.hit) {
		if (pick.hit && pick.pickedMesh?.name == "Ground1") {
			const meshCenter = pick.pickedMesh?.position;
			// const meshCenter = BABYLON.Mesh.Center([pick.pickedMesh?]);
			//makeLine(root.position, meshCenter, 2);
			console.log(meshCenter);
			console.log( 'Point down: ' + scene.pointerX + ', ' + scene.pointerY + pick.pickedMesh?.name);
			isPanning = true;
			lastPointerX = scene.pointerX;
			lastPointerY = scene.pointerY;
		}

	}
};

const onPointerUpNew = function(eventData:BABYLON.PointerInfoPre , pickResult: BABYLON.EventState) {
	isPanning = false;

	return;
	// console.log('Point up: ' + scene.pointerX + ', ' + scene.pointerY);
	if (!isPanning) return;

	const pick = scene.pick(scene.pointerX, scene.pointerY, undefined, false, null, (p0, p1, p2, ray) => {
		var p0p1 = p0.subtract(p1);
		var p2p1 = p2.subtract(p1);
		var normal = BABYLON.Vector3.Cross(p0p1, p2p1);
		return (BABYLON.Vector3.Dot(ray.direction, normal) < 0);
	});

	if (pick.hit) {
		if (pick.hit && pick.pickedMesh?.name == "Ground1") {
			const meshCenter = pick.pickedMesh?.position;
			// const meshCenter = BABYLON.Mesh.Center([pick.pickedMesh?]);
			//makeLine(root.position, meshCenter, 2);
			console.log(meshCenter);
			console.log( 'Point up: ' + scene.pointerX + ', ' + scene.pointerY + pick.pickedMesh?.name);
		}
	}
};

const onPointerMoveNew = function(eventData:BABYLON.PointerInfoPre , pickResult: BABYLON.EventState) {
	if (!isPanning) return;

	var rayX = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera, false);
	if(store.ground){
    	
        const hitInfo = rayX.intersectsMesh(store.ground);

        if(hitInfo && hitInfo.hit && hitInfo.pickedPoint){
            console.log(hitInfo.pickedPoint);
            store.icosphere?.setEnabled(true);
			
			const offsetX = hitInfo.pickedPoint?.x - lastPointerX;
			const offsetZ = hitInfo.pickedPoint?.z - lastPointerY;

            store.icosphere?.position.copyFromFloats(store.icosphere?.position.x + hitInfo.pickedPoint?.x - lastPointerX, 
				0, 
				store.icosphere?.position.z + hitInfo.pickedPoint?.z - lastPointerY);

			lastPointerX = hitInfo.pickedPoint?.x;
			lastPointerY = hitInfo.pickedPoint?.z;

			const rms = Math.sqrt(((offsetX * offsetX) + (offsetZ * offsetZ)) * 0.5);
			
			// camera.panningSensibility = 50 + 50 * offsetX;
			camera.panningSensibility = Math.abs(50 / rms);

			console.log('offsetX: ' + offsetX + ', offsetY' + offsetZ);
        }else{
            store.icosphere?.setEnabled(true);
        }
	}

	// console.log('Diff: ');
	// console.log(lastPointerX - scene.pointerX + lastPointerY - scene.pointerY);
	// console.log(lastPointerY - scene.pointerY);
};


scene.onPrePointerObservable.add(onPointerDownNew, BABYLON.PointerEventTypes.POINTERDOWN);
scene.onPrePointerObservable.add(onPointerUpNew, BABYLON.PointerEventTypes.POINTERUP);
scene.onPrePointerObservable.add(onPointerMoveNew, BABYLON.PointerEventTypes.POINTERMOVE);
