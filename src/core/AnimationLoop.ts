/**
 * AnimationLoop - Central animation loop with delta time and FPS tracking
 * 
 * Manages the requestAnimationFrame loop, provides timing information,
 * and allows registering update callbacks for animated objects.
 */

import * as THREE from 'three';

export type UpdateCallback = (deltaTime: number, elapsedTime: number) => void;

export interface AnimationLoopOptions {
  readonly onUpdate?: UpdateCallback;
  readonly onRender?: () => void;
  readonly showFPS?: boolean;
}

export class AnimationLoop {
  private readonly clock: THREE.Clock;
  private readonly updateCallbacks: Set<UpdateCallback>;
  private readonly renderCallback: (() => void) | null;

  private animationFrameId: number | null = null;
  private isRunning = false;

  // FPS tracking
  private readonly showFPS: boolean;
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 0;
  private fpsElement: HTMLElement | null = null;

  constructor(options: AnimationLoopOptions = {}) {
    this.clock = new THREE.Clock(false); // Don't auto-start
    this.updateCallbacks = new Set();
    this.renderCallback = options.onRender ?? null;
    this.showFPS = options.showFPS ?? false;

    if (options.onUpdate) {
      this.updateCallbacks.add(options.onUpdate);
    }

    if (this.showFPS) {
      this.createFPSCounter();
    }
  }

  /**
   * Create FPS counter element
   */
  private createFPSCounter(): void {
    this.fpsElement = document.createElement('div');
    this.fpsElement.id = 'fps-counter';
    this.fpsElement.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.7);
      color: #00ff00;
      font-family: monospace;
      font-size: 14px;
      border-radius: 4px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.fpsElement);
  }

  /**
   * Update FPS counter
   */
  private updateFPSCounter(): void {
    if (!this.fpsElement) return;

    this.frameCount++;
    const now = performance.now();

    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = now;
      this.fpsElement.textContent = `${this.currentFPS} FPS`;

      // Color code by performance
      if (this.currentFPS >= 55) {
        this.fpsElement.style.color = '#00ff00'; // Green - good
      } else if (this.currentFPS >= 30) {
        this.fpsElement.style.color = '#ffff00'; // Yellow - ok
      } else {
        this.fpsElement.style.color = '#ff0000'; // Red - bad
      }
    }
  }

  /**
   * The main animation loop
   */
  private loop = (): void => {
    if (!this.isRunning) return;

    this.animationFrameId = requestAnimationFrame(this.loop);

    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Call all update callbacks
    for (const callback of this.updateCallbacks) {
      callback(deltaTime, elapsedTime);
    }

    // Render
    if (this.renderCallback) {
      this.renderCallback();
    }

    // Update FPS counter
    if (this.showFPS) {
      this.updateFPSCounter();
    }
  };

  /**
   * Start the animation loop
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.clock.start();
    this.lastFPSUpdate = performance.now();
    this.loop();

    console.log('🎬 Animation loop started');
  }

  /**
   * Stop the animation loop
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.clock.stop();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    console.log('⏹️ Animation loop stopped');
  }

  /**
   * Register an update callback
   */
  public addUpdateCallback(callback: UpdateCallback): void {
    this.updateCallbacks.add(callback);
  }

  /**
   * Remove an update callback
   */
  public removeUpdateCallback(callback: UpdateCallback): void {
    this.updateCallbacks.delete(callback);
  }

  /**
   * Get current FPS
   */
  public getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Get elapsed time since loop started
   */
  public getElapsedTime(): number {
    return this.clock.getElapsedTime();
  }

  /**
   * Check if loop is running
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Toggle FPS counter visibility
   */
  public toggleFPSCounter(show?: boolean): void {
    if (!this.fpsElement) {
      if (show !== false) {
        this.createFPSCounter();
      }
      return;
    }

    this.fpsElement.style.display = show ?? this.fpsElement.style.display === 'none' 
      ? 'block' 
      : 'none';
  }

  /**
   * Clean up
   */
  public dispose(): void {
    this.stop();
    this.updateCallbacks.clear();

    if (this.fpsElement?.parentNode) {
      this.fpsElement.parentNode.removeChild(this.fpsElement);
      this.fpsElement = null;
    }
  }
}
