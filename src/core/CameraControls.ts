/**
 * CameraControls - Wrapper for OrbitControls with campfire-specific limits
 * 
 * Provides damped orbit controls with vertical and distance constraints
 * to keep the campfire always in view.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface CameraControlsOptions {
  readonly camera: THREE.PerspectiveCamera;
  readonly domElement: HTMLElement;
  readonly target?: THREE.Vector3;
  readonly enableDamping?: boolean;
  readonly dampingFactor?: number;
  readonly minDistance?: number;
  readonly maxDistance?: number;
  readonly minPolarAngle?: number;
  readonly maxPolarAngle?: number;
  readonly minAzimuthAngle?: number;
  readonly maxAzimuthAngle?: number;
  readonly enablePan?: boolean;
  readonly autoRotate?: boolean;
  readonly autoRotateSpeed?: number;
}

export class CameraControls {
  public readonly controls: OrbitControls;

  constructor(options: CameraControlsOptions) {
    this.controls = new OrbitControls(options.camera, options.domElement);

    // Set target (look at point)
    const target = options.target ?? new THREE.Vector3(0, 1, 0);
    this.controls.target.copy(target);

    // Damping for smooth movement
    this.controls.enableDamping = options.enableDamping ?? true;
    this.controls.dampingFactor = options.dampingFactor ?? 0.05;

    // Distance limits
    this.controls.minDistance = options.minDistance ?? 3;
    this.controls.maxDistance = options.maxDistance ?? 15;

    // Vertical angle limits (polar)
    // minPolarAngle: 0 = directly above
    // maxPolarAngle: PI/2 = horizontal (don't go below ground)
    this.controls.minPolarAngle = options.minPolarAngle ?? 0.1;
    this.controls.maxPolarAngle = options.maxPolarAngle ?? Math.PI / 2;

    // Horizontal angle limits (azimuth) - full rotation allowed by default
    if (options.minAzimuthAngle !== undefined) {
      this.controls.minAzimuthAngle = options.minAzimuthAngle;
    }
    if (options.maxAzimuthAngle !== undefined) {
      this.controls.maxAzimuthAngle = options.maxAzimuthAngle;
    }

    // Disable pan to keep focus on campfire
    this.controls.enablePan = options.enablePan ?? false;

    // Auto-rotate (disabled by default)
    this.controls.autoRotate = options.autoRotate ?? false;
    this.controls.autoRotateSpeed = options.autoRotateSpeed ?? 0.5;

    // Initial update
    this.controls.update();
  }

  /**
   * Update controls (call in animation loop)
   */
  public update(): void {
    this.controls.update();
  }

  /**
   * Enable/disable auto-rotation
   */
  public setAutoRotate(enabled: boolean): void {
    this.controls.autoRotate = enabled;
  }

  /**
   * Set auto-rotation speed
   */
  public setAutoRotateSpeed(speed: number): void {
    this.controls.autoRotateSpeed = speed;
  }

  /**
   * Reset camera to default position
   */
  public reset(): void {
    this.controls.reset();
  }

  /**
   * Get current camera distance from target
   */
  public getDistance(): number {
    return this.controls.getDistance();
  }

  /**
   * Get current polar angle (vertical rotation)
   */
  public getPolarAngle(): number {
    return this.controls.getPolarAngle();
  }

  /**
   * Get current azimuth angle (horizontal rotation)
   */
  public getAzimuthAngle(): number {
    return this.controls.getAzimuthAngle();
  }

  /**
   * Clean up
   */
  public dispose(): void {
    this.controls.dispose();
  }
}
