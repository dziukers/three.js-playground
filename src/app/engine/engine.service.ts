import { UserPosition } from './../core/user.types';
import { SocketService } from './../core/socket.service';
import * as THREE from 'three';
import DragControls from 'drag-controls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';

DragControls.install({ THREE });

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.PointLight;
  private cube: THREE.Mesh;
  private loader = new THREE.TextureLoader();
  private frameId: number = null;
  private otherUsers = {};

  public orbitControls: OrbitControls;
  public dragControls: DragControls;

  public constructor(
    private ngZone: NgZone,
    private socketService: SocketService
  ) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x005f7f);
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(20, 5, 0);

    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.PointLight(0xffffff, 2);
    this.light.position.set(0, 0, 5);
    this.scene.add(this.light);
    this.scene.add(new THREE.AmbientLight(0xbbbbbb));

    // SURFACE
    const groundTexture = this.loader.load('../../assets/grasslight-big.jpg');
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(25, 25);
    groundTexture.anisotropy = 16;
    const surfaceGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
    const surfaceMaterial = new THREE.MeshLambertMaterial({
      map: groundTexture,
    });

    const surfaceMesh = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surfaceMesh.castShadow = true;
    surfaceMesh.receiveShadow = true;
    surfaceMesh.rotation.x -= Math.PI / 2;
    this.scene.add(surfaceMesh);

    // MY OBJECT
    const random = Math.random() * 5 + 1;
    const position = { x: random, y: random, z: 0 };
    this.cube = this.createNewCube(0xaa0000, position);
    this.scene.add(this.cube);
    const myCube = [this.cube];
    this.socketService.sendUserPosition(position);

    // CONTROLS
    this.dragControls = new DragControls(
      myCube,
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.enabled = false;
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      console.log(event);
      const { ctrlKey } = event;
      if (ctrlKey) {
        this.orbitControls.enabled = true;
        this.dragControls.enabled = false;
      }
    });
    document.addEventListener('keyup', (event: KeyboardEvent) => {
      console.log(event);
      const { ctrlKey } = event;
      if (!ctrlKey) {
        this.orbitControls.enabled = false;
        this.dragControls.enabled = true;
      }
    });
    this.dragControls.addEventListener('drag', (event) =>
      this.socketService.sendUserPosition(event.object.position)
    );
    // this.generateConnectedUsers();

    this.socketService
      .subscribeToUserChanges()
      .subscribe(({ userId, position }) => {
        if (this.otherUsers[userId]) {
          this.otherUsers[userId].position.set(position);
        } else {
          const cube = this.createNewCube(0x00aa00, position);
          this.otherUsers[userId] = cube;
          this.scene.add(cube);
        }
      });

    this.socketService
      .subscribetoUserLogout()
      .subscribe((user) => this.scene.remove(this.otherUsers[user]));
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    Object.keys(this.otherUsers).forEach((cubeId) => {
      this.otherUsers[cubeId].rotation.x += 0.01;
      this.otherUsers[cubeId].rotation.y += 0.01;
    });
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private createNewCube(color: number, position: UserPosition): THREE.Mesh {
    const { x, y, z } = position;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color });
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.position.set(x, y, z);
    return cube;
  }

  private generateConnectedUsers(): void {
    Object.keys(this.socketService.initUsers).forEach((userId) => {
      const position = this.socketService.initUsers[userId];
      const cube = this.createNewCube(0x00aa00, position);
      this.otherUsers[userId] = cube;
      this.scene.add(cube);
    });
  }
}
