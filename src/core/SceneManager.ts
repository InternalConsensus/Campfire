/**
 * SceneManager - Central management for Three.js scene, camera, and renderer
 * 
 * Implements singleton pattern for global access to core Three.js objects.
 * Handles initialization, resize, and disposal of WebGL resources.
 */

import * as THREE from 'three';
import { PostProcessing } from './PostProcessing';

export interface SceneManagerOptions {
  readonly container: HTMLElement;
  readonly fov?: number;
  readonly near?: number;
  readonly far?: number;
  readonly antialias?: boolean;
  readonly alpha?: boolean;
  readonly enablePostProcessing?: boolean;
}

export class SceneManager {
  private static instance: SceneManager | null = null;

  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly postProcessing: PostProcessing | null;

  private readonly container: HTMLElement;
  private readonly resizeHandler: () => void;
  private readonly usePostProcessing: boolean;

  private constructor(options: SceneManagerOptions) {
    this.container = options.container;
    this.usePostProcessing = options.enablePostProcessing ?? true;

    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0604);

    // Create camera
    // FOV 50, positioned to view campfire from slight angle
    this.camera = new THREE.PerspectiveCamera(
      options.fov ?? 50,
      this.getAspect(),
      options.near ?? 0.1,
      options.far ?? 100
    );
    this.camera.position.set(0, 3, 8);
    this.camera.lookAt(0, 1, 0);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: options.antialias ?? true,
      alpha: options.alpha ?? true,
      powerPreference: 'high-performance',
    });

    this.configureRenderer();
    this.container.appendChild(this.renderer.domElement);

    // Initialize post-processing
    if (this.usePostProcessing) {
      this.postProcessing = new PostProcessing(
        this.renderer,
        this.scene,
        this.camera
      );
    } else {
      this.postProcessing = null;
    }

    // Bind resize handler
    this.resizeHandler = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Initialize or get the singleton instance
   */
  public static init(options: SceneManagerOptions): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager(options);
    }
    return SceneManager.instance;
  }

  /**
   * Get existing instance (throws if not initialized)
   */
  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      throw new Error('SceneManager not initialized. Call init() first.');
    }
    return SceneManager.instance;
  }

  /**
   * Configure WebGL renderer settings
   */
  private configureRenderer(): void {
    const { renderer } = this;

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Tone mapping for realistic lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Color management
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  /**
   * Get current aspect ratio
   */
  private getAspect(): number {
    return window.innerWidth / window.innerHeight;
  }

  /**
   * Handle window resize
   */
  private onResize(): void {
    this.camera.aspect = this.getAspect();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    if (this.postProcessing) {
      this.postProcessing.setSize(window.innerWidth, window.innerHeight);
    }
  }

  /**
   * Render current frame
   */
  public render(deltaTime: number = 0): void {
    if (this.postProcessing) {
      this.postProcessing.render(deltaTime);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Add object to scene
   */
  public add(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  /**
   * Remove object from scene
   */
  public remove(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  /**
   * Get renderer info for debugging
   */
  public getRendererInfo(): THREE.WebGLInfo {
    return this.renderer.info;
  }

  /**
   * Log renderer stats to console
   */
  public logStats(): void {
    const info = this.renderer.info;
    console.log('=== Renderer Stats ===');
    console.log('Draw calls:', info.render.calls);
    console.log('Triangles:', info.render.triangles);
    console.log('Geometries:', info.memory.geometries);
    console.log('Textures:', info.memory.textures);
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    window.removeEventListener('resize', this.resizeHandler);

    // Dispose post-processing
    if (this.postProcessing) {
      this.postProcessing.dispose();
    }

    // Dispose renderer
    this.renderer.dispose();
    this.renderer.forceContextLoss();

    // Remove canvas
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Clear scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    this.scene.clear();

    SceneManager.instance = null;
  }
}
