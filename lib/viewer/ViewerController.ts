import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Presentation } from "../exhibits/schema";

type ViewerOptions = Readonly<{ modelUrl: string; presentation: Presentation; onReady: () => void; onError: (message: string) => void }>;

export class ViewerController {
  private readonly container: HTMLElement;
  private readonly options: ViewerOptions;
  private readonly abortController = new AbortController();
  private readonly canvas = document.createElement("canvas");
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly clock = new THREE.Clock();
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  private readonly resizeObserver: ResizeObserver;
  private readonly intersectionObserver: IntersectionObserver;
  private model?: THREE.Group;
  private mixer?: THREE.AnimationMixer;
  private frame = 0;
  private visible = true;
  private intersecting = true;
  private ready = false;
  private pausedUntil = 0;
  private initialCamera = new THREE.Vector3();

  constructor(container: HTMLElement, options: ViewerOptions) {
    this.container = container;
    this.options = options;
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.tabIndex = -1;
    const context = this.canvas.getContext("webgl2", { alpha: true, antialias: true, powerPreference: "high-performance" });
    if (!context) throw new Error("WebGL 2 is unavailable");
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, context, alpha: true, antialias: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = false;
    this.camera = new THREE.PerspectiveCamera(options.presentation.cameraFov, 1, 0.01, 100);
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enablePan = false;
    this.controls.enableDamping = !this.reducedMotion.matches;
    this.controls.dampingFactor = 0.06;
    this.controls.minPolarAngle = Math.PI * 0.24;
    this.controls.maxPolarAngle = Math.PI * 0.62;
    this.controls.addEventListener("start", this.pauseAfterInteraction);
    this.container.append(this.canvas);
    this.addLightsAndContactShadow();
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(container);
    this.intersectionObserver = new IntersectionObserver(([entry]) => { this.intersecting = entry?.isIntersecting ?? false; this.requestFrame(); }, { threshold: 0.05 });
    this.intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.load();
  }

  private addLightsAndContactShadow() {
    this.scene.add(new THREE.HemisphereLight(0xfff7e8, 0x59685b, 2.1));
    const key = new THREE.DirectionalLight(0xffe3bd, 2.4);
    key.position.set(4, 7, 5);
    this.scene.add(key);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = shadowCanvas.height = 128;
    const context = shadowCanvas.getContext("2d");
    const gradient = context?.createRadialGradient(64, 64, 4, 64, 64, 60);
    if (context && gradient) {
      gradient.addColorStop(0, "rgba(25,35,29,.28)"); gradient.addColorStop(1, "rgba(25,35,29,0)");
      context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
    }
    const texture = new THREE.CanvasTexture(shadowCanvas);
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.2), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
    plane.rotation.x = -Math.PI / 2; plane.position.y = 0.002; plane.name = "programmatic contact shadow";
    this.scene.add(plane);
  }

  private async load() {
    try {
      const response = await fetch(this.options.modelUrl, { signal: this.abortController.signal });
      if (!response.ok) throw new Error(`model request failed (${response.status})`);
      const buffer = await response.arrayBuffer();
      const gltf = await new GLTFLoader().parseAsync(buffer, "");
      if (this.abortController.signal.aborted) return;
      this.model = gltf.scene;
      this.scene.add(this.model);
      this.fitCamera();
      if (gltf.animations[0] && !this.reducedMotion.matches) {
        this.mixer = new THREE.AnimationMixer(this.model);
        this.mixer.clipAction(gltf.animations[0]).play();
      }
      this.ready = true;
      this.render(performance.now());
      this.options.onReady();
    } catch (error) {
      if (!this.abortController.signal.aborted) this.options.onError(error instanceof Error ? error.message : "model failed");
    }
  }

  private fitCamera() {
    if (!this.model) return;
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    this.controls.target.set(center.x, box.min.y + size.y * this.options.presentation.targetHeightRatio, center.z);
    const aspect = Math.max(this.container.clientWidth / Math.max(this.container.clientHeight, 1), 0.4);
    const horizontalPadding = aspect < 1 ? 0.9 : 1.35;
    const vertical = Math.max(size.y * 1.65, size.x / aspect * horizontalPadding);
    const distance = (vertical / 2) / Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const [blenderX, blenderY, blenderZ] = this.options.presentation.cameraDirection;
    const direction = new THREE.Vector3(blenderX, blenderZ, -blenderY).normalize();
    this.camera.position.copy(this.controls.target).addScaledVector(direction, distance * (this.options.presentation.cameraDistanceFactor ?? 1.75));
    this.initialCamera.copy(this.camera.position);
    this.controls.minDistance = distance * this.options.presentation.minDistanceFactor;
    this.controls.maxDistance = distance * this.options.presentation.maxDistanceFactor;
    this.camera.near = Math.max(distance / 100, 0.01); this.camera.far = distance * 20; this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  private resize = () => {
    const width = Math.max(this.container.clientWidth, 1), height = Math.max(this.container.clientHeight, 1);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height; this.camera.updateProjectionMatrix();
    if (this.model) this.fitCamera();
    this.requestFrame();
  };
  private pauseAfterInteraction = () => { this.pausedUntil = performance.now() + 4000; };
  private onVisibilityChange = () => { this.visible = !document.hidden; this.requestFrame(); };
  private onContextLost = (event: Event) => { event.preventDefault(); this.options.onError("WebGL context was lost"); this.dispose(); };
  private requestFrame() { if (!this.frame && this.visible && this.intersecting) this.frame = requestAnimationFrame(this.render); }
  private render = (time: number) => {
    this.frame = 0;
    if (!this.visible || !this.intersecting) return;
    const delta = Math.min(this.clock.getDelta(), 0.05);
    if (this.mixer) this.mixer.update(delta);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const saveData = connection?.saveData;
    if (this.model && !this.reducedMotion.matches && !saveData && time > this.pausedUntil) this.model.rotation.y += this.options.presentation.autoRotateRadiansPerSecond * delta;
    this.controls.update(); this.renderer.render(this.scene, this.camera);
    if (this.ready && (!this.reducedMotion.matches || this.mixer)) this.requestFrame();
  };

  rotate(direction: -1 | 1) { if (this.model) this.model.rotation.y += direction * 0.18; this.pauseAfterInteraction(); this.requestFrame(); }
  zoom(factor: number) { this.camera.position.lerp(this.controls.target, factor); this.controls.update(); this.pauseAfterInteraction(); this.requestFrame(); }
  reset() { if (this.model) this.model.rotation.y = 0; this.camera.position.copy(this.initialCamera); this.controls.update(); this.pauseAfterInteraction(); this.requestFrame(); }

  dispose() {
    this.abortController.abort(); cancelAnimationFrame(this.frame); this.frame = 0;
    this.resizeObserver.disconnect(); this.intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.controls.removeEventListener("start", this.pauseAfterInteraction); this.controls.dispose(); this.mixer?.stopAllAction();
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const material of materials) {
        for (const value of Object.values(material)) if (value instanceof THREE.Texture) { value.source.data?.close?.(); value.dispose(); }
        material.dispose();
      }
    });
    this.renderer.dispose(); this.renderer.forceContextLoss(); this.canvas.remove();
  }
}
