/**
 * Post-Processing Pipeline
 * 
 * Cinematic post-processing effects for photorealistic rendering:
 * - Bloom for fire glow
 * - Depth of Field for background blur
 * - Vignette for cinematic framing
 * - Color grading for warmth
 * - Film grain for texture
 * - Chromatic aberration for realism
 */

import * as THREE from 'three';
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BloomEffect,
  VignetteEffect,
  NoiseEffect,
  ChromaticAberrationEffect,
  ToneMappingEffect,
  ToneMappingMode,
  BlendFunction,
  KernelSize,
  SMAAEffect,
  SMAAPreset,
  DepthOfFieldEffect,
} from 'postprocessing';

/** Configuration for bloom effect */
interface BloomConfig {
  /** Bloom intensity */
  readonly intensity: number;
  /** Luminance threshold for bloom */
  readonly luminanceThreshold: number;
  /** Smoothing for luminance */
  readonly luminanceSmoothing: number;
  /** Blur kernel size */
  readonly kernelSize: KernelSize;
  /** Use mipmap blur for performance */
  readonly mipmapBlur: boolean;
}

/** Configuration for depth of field */
interface DOFConfig {
  /** Focus distance from camera */
  readonly focusDistance: number;
  /** Focal length (affects blur amount) */
  readonly focalLength: number;
  /** Bokeh scale */
  readonly bokehScale: number;
}

/** Configuration for vignette */
interface VignetteConfig {
  /** Vignette offset from edge */
  readonly offset: number;
  /** Vignette darkness */
  readonly darkness: number;
}

/** Configuration for film grain */
interface GrainConfig {
  /** Whether grain is enabled */
  readonly enabled: boolean;
  /** Blend function for grain */
  readonly blendFunction: BlendFunction;
}

/** Configuration for chromatic aberration */
interface ChromaticConfig {
  /** Offset amount for color fringing */
  readonly offset: THREE.Vector2;
  /** Radial modulation (stronger at edges) */
  readonly radialModulation: boolean;
}

/** Full post-processing configuration */
interface PostProcessingConfig {
  readonly bloom: BloomConfig;
  readonly dof: DOFConfig;
  readonly vignette: VignetteConfig;
  readonly grain: GrainConfig;
  readonly chromatic: ChromaticConfig;
  /** Enable SMAA anti-aliasing */
  readonly enableSMAA: boolean;
  /** Enable tone mapping */
  readonly enableToneMapping: boolean;
}

/** Default post-processing configuration */
const DEFAULT_CONFIG: PostProcessingConfig = {
  bloom: {
    intensity: 1.5,
    luminanceThreshold: 0.4,
    luminanceSmoothing: 0.3,
    kernelSize: KernelSize.LARGE,
    mipmapBlur: true,
  },
  dof: {
    focusDistance: 0.05,
    focalLength: 0.05,
    bokehScale: 3.0,
  },
  vignette: {
    offset: 0.35,
    darkness: 0.5,
  },
  grain: {
    enabled: true,
    blendFunction: BlendFunction.OVERLAY,
  },
  chromatic: {
    offset: new THREE.Vector2(0.001, 0.001),
    radialModulation: true,
  },
  enableSMAA: true,
  enableToneMapping: true,
};

export class PostProcessing {
  private readonly config: PostProcessingConfig;
  private readonly composer: EffectComposer;
  
  // Individual effects for runtime control
  private readonly bloomEffect: BloomEffect;
  private readonly dofEffect: DepthOfFieldEffect;
  private readonly vignetteEffect: VignetteEffect;
  private readonly noiseEffect: NoiseEffect;
  private readonly chromaticEffect: ChromaticAberrationEffect;
  private readonly smaaEffect: SMAAEffect | null;
  private readonly toneMappingEffect: ToneMappingEffect | null;

  // Effect passes for toggling
  private readonly effectPass: EffectPass;

  // Track enabled state for each effect
  private effectsEnabled = {
    bloom: true,
    dof: true,
    vignette: true,
    grain: true,
    chromatic: true,
    smaa: true,
    toneMapping: true,
  };

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    config: Partial<PostProcessingConfig> = {}
  ) {
    // Deep merge config
    this.config = {
      bloom: { ...DEFAULT_CONFIG.bloom, ...config.bloom },
      dof: { ...DEFAULT_CONFIG.dof, ...config.dof },
      vignette: { ...DEFAULT_CONFIG.vignette, ...config.vignette },
      grain: { ...DEFAULT_CONFIG.grain, ...config.grain },
      chromatic: { ...DEFAULT_CONFIG.chromatic, ...config.chromatic },
      enableSMAA: config.enableSMAA ?? DEFAULT_CONFIG.enableSMAA,
      enableToneMapping: config.enableToneMapping ?? DEFAULT_CONFIG.enableToneMapping,
    };

    // Create effect composer
    this.composer = new EffectComposer(renderer, {
      frameBufferType: THREE.HalfFloatType,
    });

    // Render pass (first in chain)
    const renderPass = new RenderPass(scene, camera);
    this.composer.addPass(renderPass);

    // =========================================================================
    // Create Effects
    // =========================================================================

    // Bloom effect for fire glow
    this.bloomEffect = new BloomEffect({
      intensity: this.config.bloom.intensity,
      luminanceThreshold: this.config.bloom.luminanceThreshold,
      luminanceSmoothing: this.config.bloom.luminanceSmoothing,
      kernelSize: this.config.bloom.kernelSize,
      mipmapBlur: this.config.bloom.mipmapBlur,
    });

    // Depth of Field for background blur
    this.dofEffect = new DepthOfFieldEffect(camera, {
      focusDistance: this.config.dof.focusDistance,
      focalLength: this.config.dof.focalLength,
      bokehScale: this.config.dof.bokehScale,
    });

    // Vignette for cinematic framing
    this.vignetteEffect = new VignetteEffect({
      offset: this.config.vignette.offset,
      darkness: this.config.vignette.darkness,
    });

    // Film grain for texture
    this.noiseEffect = new NoiseEffect({
      blendFunction: this.config.grain.blendFunction,
    });
    this.noiseEffect.blendMode.opacity.value = 0.15;

    // Chromatic aberration for realism
    this.chromaticEffect = new ChromaticAberrationEffect({
      offset: this.config.chromatic.offset,
      radialModulation: this.config.chromatic.radialModulation,
      modulationOffset: 0.5,
    });

    // SMAA anti-aliasing
    this.smaaEffect = this.config.enableSMAA
      ? new SMAAEffect({ preset: SMAAPreset.HIGH })
      : null;

    // Tone mapping (ACESFilmic for cinematic look)
    this.toneMappingEffect = this.config.enableToneMapping
      ? new ToneMappingEffect({
          mode: ToneMappingMode.ACES_FILMIC,
        })
      : null;

    // =========================================================================
    // Build Effect Pass
    // =========================================================================

    const effects: (BloomEffect | DepthOfFieldEffect | VignetteEffect | NoiseEffect | ChromaticAberrationEffect | SMAAEffect | ToneMappingEffect)[] = [
      this.bloomEffect,
      this.dofEffect,
      this.vignetteEffect,
      this.chromaticEffect,
      this.noiseEffect,
    ];

    if (this.smaaEffect) {
      effects.push(this.smaaEffect);
    }

    if (this.toneMappingEffect) {
      effects.push(this.toneMappingEffect);
    }

    this.effectPass = new EffectPass(camera, ...effects);
    this.composer.addPass(this.effectPass);
  }

  /**
   * Render the post-processed frame
   */
  render(deltaTime: number): void {
    this.composer.render(deltaTime);
  }

  /**
   * Handle window resize
   */
  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
  }

  /**
   * Toggle bloom effect
   */
  setBloomEnabled(enabled: boolean): void {
    this.effectsEnabled.bloom = enabled;
    this.bloomEffect.blendMode.opacity.value = enabled ? 1 : 0;
  }

  /**
   * Set bloom intensity
   */
  setBloomIntensity(intensity: number): void {
    this.bloomEffect.intensity = intensity;
  }

  /**
   * Toggle depth of field
   */
  setDOFEnabled(enabled: boolean): void {
    this.effectsEnabled.dof = enabled;
    this.dofEffect.blendMode.opacity.value = enabled ? 1 : 0;
  }

  /**
   * Set DOF focus distance
   */
  setFocusDistance(distance: number): void {
    this.dofEffect.cocMaterial.uniforms.focusDistance.value = distance;
  }

  /**
   * Toggle vignette
   */
  setVignetteEnabled(enabled: boolean): void {
    this.effectsEnabled.vignette = enabled;
    this.vignetteEffect.blendMode.opacity.value = enabled ? 1 : 0;
  }

  /**
   * Toggle film grain
   */
  setGrainEnabled(enabled: boolean): void {
    this.effectsEnabled.grain = enabled;
    this.noiseEffect.blendMode.opacity.value = enabled ? 0.15 : 0;
  }

  /**
   * Toggle chromatic aberration
   */
  setChromaticEnabled(enabled: boolean): void {
    this.effectsEnabled.chromatic = enabled;
    this.chromaticEffect.blendMode.opacity.value = enabled ? 1 : 0;
  }

  /**
   * Disable all effects (for performance testing)
   */
  disableAll(): void {
    this.setBloomEnabled(false);
    this.setDOFEnabled(false);
    this.setVignetteEnabled(false);
    this.setGrainEnabled(false);
    this.setChromaticEnabled(false);
  }

  /**
   * Enable all effects
   */
  enableAll(): void {
    this.setBloomEnabled(true);
    this.setDOFEnabled(true);
    this.setVignetteEnabled(true);
    this.setGrainEnabled(true);
    this.setChromaticEnabled(true);
  }

  /**
   * Get effect composer for advanced access
   */
  getComposer(): EffectComposer {
    return this.composer;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.composer.dispose();
  }
}
