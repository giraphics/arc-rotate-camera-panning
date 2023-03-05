import * as BABYLON from '@babylonjs/core';
import TWEEN from '@tweenjs/tween.js'
import { GridMaterial } from '@babylonjs/materials';

export default class SimpleStore {
  // Dynamic flag to update the GUI based on current selection pick
  public isGuiDirty = false;

  // Drawing Mesh objects
  public box ?: BABYLON.Mesh;
  public ground ?: BABYLON.Mesh;
  public icosphere ?: BABYLON.Mesh;
  public cylinder ?: BABYLON.Mesh;

  // Current selected object and its name
  public currentSelection ?: BABYLON.Mesh;
  public currentSelectionName : string | undefined;

  // Transform node for holding transformations
  public transformNode : BABYLON.TransformNode;

  // Box/Cube attributes
  public boxName = 'Box';
  public boxHeight: number = 1;
  public boxWidth: number = 1;
  public boxDepth: number = 1;
  public sceneDirty = false;

  // Cylinder attributes
  public cylinderName = 'Cylinder';
  public cylinderHeight: number = 2;
  public cylinderDiameter: number = 1;

  // Sphere attributes
  public icoSphereName = 'IcoSphere';
  public icoSphereDiameter: number = 1;
  public icoSphereSubdivisions: number = 15;

  // Animation attributes
  public animationAmplitude = 10;
  public animationDuration = 2000;
  public tween = new TWEEN.Tween({x: 0, y: 0, z: 0});

  constructor() {
    // Create a transform node, the tranform node will be applied on the selected item
    this.transformNode = new BABYLON.TransformNode("root");

    // Default selected item for bounce animation
    this.currentSelectionName = this.boxName;
  }

  // Remove mesh from scene
  public remove(scene: BABYLON.Scene, shape: BABYLON.Mesh) {
    scene.removeMesh(shape);
  }

  public applyBouncing(node: BABYLON.TransformNode, amplitude: number, duration: number) {
    this.tween = new TWEEN.Tween({x: 0, y: amplitude, z: 0}).to({x: 0, y: 0, z: 0}, duration).easing(TWEEN.Easing.Bounce.Out).repeat(100);
		
    this.tween.onUpdate(function (object: { x: number; y: number; z: number; }, elapsed: number) {
			if (node) {
				node.position.x = object.x;
				node.position.y = object.y;
				node.position.z = object.z;
			}
		})

		this.tween.start();
  }

  public createBox(name: string, scene: BABYLON.Scene, height: number = 1, width: number = 1, depth: number = 1) {

    // Remove old object if exist and create new one.
    if (this.box) {
      this.remove(scene, this.box);
    }

    this.box = BABYLON.MeshBuilder.CreateBox(name, { height: height, width: width, depth: depth}, scene);
    this.box.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0);

    if (this.currentSelectionName == name) {
      this.box.parent = this.transformNode;  //apply to Box	
      this.currentSelection = this.box;
    }
  }

  public createGround(name: string, scene: BABYLON.Scene, width: number, height: number) {
    this.ground = BABYLON.MeshBuilder.CreateGround(name, {width: width, height: height}, scene);
    let gridMat = new GridMaterial('mat' + 'Material', scene);

    gridMat.mainColor = new BABYLON.Color3(0.19, 0.19, 0.19);
    gridMat.lineColor = new BABYLON.Color3(0.31, 0.31, 0.31);

    gridMat.gridRatio = 10;
    this.ground.material = gridMat;
  }

  public createCylinder(name: string, scene: BABYLON.Scene, diameter: number, height: number) {

    // Remove old object if exist and create new one.
    if (this.cylinder) {
      this.remove(scene, this.cylinder);
    }

    this.cylinder = BABYLON.MeshBuilder.CreateCylinder(name, {diameterBottom: diameter, diameterTop: diameter, height: height}, scene);
    this.cylinder.position.set(2, 0, 0);

    if (this.currentSelectionName == name) {
      this.cylinder.parent = this.transformNode;
      this.currentSelection = this.cylinder;
    }
  }

  public createIcosphere(name: string, scene: BABYLON.Scene, diameter: number, subdivision: number) {

    // Remove old object if exist and create new one.
    if (this.icosphere) {
      this.remove(scene, this.icosphere);
    }

    const radius = diameter * 0.5;
    this.icosphere = BABYLON.MeshBuilder.CreateIcoSphere(name, { radiusX: radius, radiusY: radius, radiusZ: radius, subdivisions: subdivision}, scene);
    this.icosphere.position.set(-20, 0, 0);

    if (this.currentSelectionName == name) {
      this.icosphere.parent = this.transformNode;
      this.currentSelection = this.icosphere;
    }
  }
}
