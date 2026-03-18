import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, Quaternion, TransformNode  } from 'babylonjs';
import 'babylonjs-loaders';
import Gui from './ui/gui';
import SimpleStore from './store/store';

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Couldn't find a canvas. Aborting the demo")

const engine = new Engine(canvas, true, {});
const scene = new Scene(engine);

const store = new SimpleStore();
const gui = new Gui(store, canvas, null, 1520, 640);
gui.setup();

function prepareScene() {
	// Camera
	const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 4, new Vector3(0, 0, 0), scene);
	camera.attachControl(canvas, true);

	// Light
	new HemisphericLight("light", new Vector3(0.5, 1, 0.8).normalize(), scene);

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
	  store.createIcosphere('IcoSphere', scene, store.icoSphereDiameter, store.icoSphereSubdivisions);
	  store.sceneDirty = false;
	}
 
	scene.render();
  });
  

window.addEventListener("resize", () => {
  engine.resize();
})

const onPointerDown = function() {
  // Perform selection
  const pick = scene.pick(scene.pointerX, scene.pointerY, undefined, false, null, (p0: Vector3, p1: Vector3, p2: Vector3, ray) => {
	let p0p1 : BABYLON.DeepImmutable<Vector3> = p0.subtract(p1);
	const p2p1 : BABYLON.DeepImmutable<Vector3> = p2.subtract(p1);
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