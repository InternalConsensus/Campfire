---
goal: High-Fidelity WebGL Campfire Experience
version: 1.1
date_created: 2026-01-29
last_updated: 2026-01-29
owner: Brian
status: Planned
tags: [feature, architecture]
agents_enabled: true
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Create a high-fidelity, photorealistic campfire website using WebGL/Three.js with procedural geometry, custom shaders, particle systems, and post-processing effects. The goal is to achieve visual quality comparable to UE5 web experiences (like lusion.co and ilabsolutions.it) without requiring 3D models or texture artists - everything will be code-generated.

## GitHub Copilot Custom Agents

This project leverages specialized GitHub Copilot agents for different expertise domains. Each agent has specific knowledge and instructions for their domain.

### Agent Definitions

| Agent ID | Name | Expertise | Primary Tools & Frameworks |
|----------|------|-----------|----------------------------|
| **AGT-001** | **Build Engineer** | Project setup, build tools, dependencies, TypeScript configuration | npm, Vite, TypeScript, package.json, tsconfig.json |
| **AGT-002** | **Three.js Architect** | Scene management, cameras, renderers, animation loops, core Three.js patterns | Three.js core API, WebGL context, OrbitControls, Clock |
| **AGT-003** | **Shader Developer** | GLSL programming, vertex/fragment shaders, noise algorithms, shader optimization | GLSL, WebGL shaders, noise functions, FBM, gradients |
| **AGT-004** | **Particle Systems Engineer** | Particle physics, emitters, life cycles, GPU instancing, BufferGeometry | Three.js Points, particles, physics simulation, instancing |
| **AGT-005** | **VFX Artist** | Post-processing effects, bloom, DOF, color grading, compositing | EffectComposer, postprocessing library, render passes |
| **AGT-006** | **Procedural Generation Specialist** | Geometry generation, noise-based displacement, mathematical modeling | Simplex noise, procedural meshes, IcosahedronGeometry |
| **AGT-007** | **Lighting & Materials Expert** | Dynamic lighting, shadows, material properties, PBR workflows | PointLight, shadows, MeshStandardMaterial, tone mapping |
| **AGT-008** | **Audio Engineer** | Web Audio API, sound synthesis, spatial audio, procedural audio | Web Audio API, oscillators, filters, PositionalAudio |
| **AGT-009** | **UI/UX Developer** | HTML, CSS, loading screens, UI controls, keyboard shortcuts | HTML5, CSS3, DOM APIs, Fullscreen API |
| **AGT-010** | **Performance Optimizer** | Profiling, LOD systems, frustum culling, memory management, adaptive quality | Chrome DevTools, WebGL profiling, optimization patterns |
| **AGT-011** | **QA Tester** | Cross-browser testing, performance validation, visual quality assurance | Browser DevTools, manual testing, metrics validation |
| **AGT-012** | **DevOps Engineer** | Build optimization, deployment, compression, CI/CD | Vite production builds, gzip, static hosting, GitHub Actions |

### Agent Instruction Files

Each agent has a custom instruction file in `.github/copilot-instructions/agents/`:

- `AGT-001-build-engineer.md` - Build system and dependency management expertise
- `AGT-002-threejs-architect.md` - Three.js core architecture and patterns
- `AGT-003-shader-developer.md` - GLSL shader programming and optimization
- `AGT-004-particle-engineer.md` - Particle system implementation and physics
- `AGT-005-vfx-artist.md` - Post-processing and visual effects
- `AGT-006-procedural-specialist.md` - Procedural generation algorithms
- `AGT-007-lighting-expert.md` - Lighting, shadows, and materials
- `AGT-008-audio-engineer.md` - Audio synthesis and spatial sound
- `AGT-009-ui-developer.md` - User interface and interaction design
- `AGT-010-performance-optimizer.md` - Performance profiling and optimization
- `AGT-011-qa-tester.md` - Testing methodologies and quality assurance
- `AGT-012-devops-engineer.md` - Deployment and production optimization

## 1. Requirements & Constraints

### Technical Stack
- **REQ-001**: Use Three.js r160+ as the WebGL framework
- **REQ-002**: Use Vite as the build tool for fast development and optimized production builds
- **REQ-003**: Implement custom GLSL shaders for fire, embers, and atmospheric effects
- **REQ-004**: Use Three.js EffectComposer for post-processing pipeline
- **REQ-005**: Target 60 FPS on modern hardware (RTX 3060+ equivalent, M1 Mac or better)
- **REQ-006**: Responsive design supporting desktop resolutions (1920x1080 minimum)

### Visual Quality Requirements
- **REQ-007**: Photorealistic fire with volumetric appearance using noise-based shaders
- **REQ-008**: Dynamic particle system for embers floating upward (500-2000 particles)
- **REQ-009**: Smoke particles with alpha blending and turbulence (200-500 particles)
- **REQ-010**: Procedurally generated logs and rocks for campfire structure
- **REQ-011**: Dynamic lighting affecting the environment
- **REQ-012**: Ambient environmental effects (ground fog, atmospheric scattering)

### Post-Processing Effects
- **REQ-013**: Bloom effect for fire glow and ember trails
- **REQ-014**: Color grading for warm, cinematic atmosphere
- **REQ-015**: Depth of field for cinematic focus
- **REQ-016**: Chromatic aberration for subtle realism
- **REQ-017**: Vignette effect for framing

### Performance Constraints
- **CON-001**: Maximum initial load time of 3 seconds on broadband connection
- **CON-002**: No external 3D model files (.glb, .obj) - all geometry procedural
- **CON-003**: No texture image files - all materials shader-based or procedural
- **CON-004**: Total bundle size under 500KB (gzipped)
- **CON-005**: Memory usage under 512MB

### User Experience
- **REQ-018**: Smooth camera controls (orbit around campfire)
- **REQ-019**: Audio integration for crackling fire sounds (optional, user-activated)
- **REQ-020**: Ambient audio for forest sounds (optional)
- **REQ-021**: Loading screen with percentage indicator

### Code Quality Guidelines
- **GUD-001**: Follow modular architecture with separate files for each major component
- **GUD-002**: Use TypeScript for type safety
- **GUD-003**: Implement proper cleanup/disposal methods for Three.js objects
- **GUD-004**: Comment all shader code extensively
- **GUD-005**: Use requestAnimationFrame for animation loop with delta time

### Architectural Patterns
- **PAT-001**: Scene-Component pattern: Separate components (Fire, Embers, Smoke, Rocks, Logs)
- **PAT-002**: Shader management: Centralized shader library with hot-reloading in dev
- **PAT-003**: Resource management: Singleton pattern for scene, renderer, camera
- **PAT-004**: Animation system: Central time manager for synchronized effects

### Security Requirements
- **SEC-001**: No external API calls or data fetching (fully static site)
- **SEC-002**: Content Security Policy headers for XSS protection
- **SEC-003**: Sanitize any user input if audio controls are added

## 2. Implementation Steps

### Phase 1: Project Setup & Infrastructure
**GOAL-001**: Establish development environment with Vite, Three.js, and TypeScript configuration

| Task     | Description                                                                                              | Completed | Date |
| -------- | -------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-001 | Initialize Vite project with TypeScript template: \
pm create vite@latest . -- --template vanilla-ts\ |           |      |
| TASK-002 | Install Three.js: \
pm install three @types/three\                                                     |           |      |
| TASK-003 | Install postprocessing library: \
pm install postprocessing\                                           |           |      |
| TASK-004 | Configure vite.config.ts with GLSL shader loader plugin                                                  |           |      |
| TASK-005 | Set up project folder structure: /src/core, /src/components, /src/shaders, /src/utils, /src/audio       |           |      |
| TASK-006 | Create index.html with canvas element and loading screen markup                                          |           |      |
| TASK-007 | Create main.ts entry point with basic Three.js scene setup                                               |           |      |
| TASK-008 | Configure tsconfig.json for strict type checking                                                         |           |      |

### Phase 2: Core Scene Infrastructure
**GOAL-002**: Build foundational Three.js scene management system with camera, renderer, and animation loop

| Task      | Description                                                                                        | Completed | Date |
| --------- | -------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-009  | Create SceneManager class in /src/core/SceneManager.ts managing scene, camera, renderer           |           |      |
| TASK-010  | Implement PerspectiveCamera setup with FOV 50, position at (0, 3, 8), looking at (0, 1, 0)        |           |      |
| TASK-011  | Create WebGLRenderer with antialias, alpha, logarithmicDepthBuffer, powerPreference: high-perf    |           |      |
| TASK-012  | Implement responsive canvas sizing with window resize handler                                      |           |      |
| TASK-013  | Create OrbitControls wrapper in /src/core/CameraControls.ts with limits (theta: 0-PI, phi: 0-PI/2)|           |      |
| TASK-014  | Build AnimationLoop class in /src/core/AnimationLoop.ts with delta time calculation                |           |      |
| TASK-015  | Implement Clock-based timing system for consistent animation speeds                                 |           |      |
| TASK-016  | Add requestAnimationFrame loop with FPS counter for development                                     |           |      |

### Phase 3: Procedural Geometry Generation
**GOAL-003**: Create procedural geometry generators for rocks, logs, and ground plane without requiring 3D models

| Task      | Description                                                                                                   | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-017  | Create RockGenerator class in /src/components/RockGenerator.ts using IcosahedronGeometry with noise deformation |           |      |
| TASK-018  | Implement Simplex/Perlin noise function for rock surface displacement (8-12 vertices per rock)                  |           |      |
| TASK-019  | Generate rock ring: 8-12 rocks in circle, radius 1.5-2.0, random rotations and scales (0.3-0.6)                 |           |      |
| TASK-020  | Create LogGenerator class in /src/components/LogGenerator.ts using CylinderGeometry with tapered ends            |           |      |
| TASK-021  | Generate 4-6 logs in teepee formation, length 1.5-2.0, radius 0.1-0.15, angle 45-60 degrees                     |           |      |
| TASK-022  | Add bark texture noise to logs using vertex displacement                                                          |           |      |
| TASK-023  | Create ground plane: CircleGeometry radius 10, 64 segments with subtle height variation                          |           |      |
| TASK-024  | Apply material to rocks: dark gray (0x2a2a2a), roughness 0.8, metalness 0.1                                      |           |      |
| TASK-025  | Apply material to logs: brown (0x3d2817), roughness 0.9, metalness 0.0                                           |           |      |

### Phase 4: Fire Shader System
**GOAL-004**: Implement volumetric fire shader with noise-based animation and realistic flame behavior

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-026  | Create fire vertex shader in /src/shaders/fire.vert.glsl with position and UV passthrough                          |           |      |
| TASK-027  | Create fire fragment shader in /src/shaders/fire.frag.glsl using FBM (Fractal Brownian Motion) noise               |           |      |
| TASK-028  | Implement 3D noise function (Simplex or Perlin) in GLSL for flame turbulence                                       |           |      |
| TASK-029  | Add time-based uniform (uTime) for animated noise scrolling upward                                                  |           |      |
| TASK-030  | Create flame shape using radial gradient combined with noise (hot center, dissipating edges)                        |           |      |
| TASK-031  | Implement color ramp: black  red (0x8b0000)  orange (0xff4500)  yellow (0xffff00)  white (hot spots)           |           |      |
| TASK-032  | Add alpha channel with smooth falloff for transparency at edges and top                                             |           |      |
| TASK-033  | Create FireMesh class in /src/components/Fire.ts using custom ShaderMaterial                                        |           |      |
| TASK-034  | Use cone or custom geometry for fire volume: height 1.5-2.0, base radius 0.5                                        |           |      |
| TASK-035  | Set material properties: transparent, blending: AdditiveBlending, depthWrite: false                                 |           |      |
| TASK-036  | Add secondary fire layer with offset timing for depth and volume                                                    |           |      |
| TASK-037  | Implement update method to increment uTime uniform in animation loop                                                |           |      |

### Phase 5: Particle Systems - Embers
**GOAL-005**: Create realistic ember particle system with physics, glow, and life-cycle management

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-038  | Create EmberParticle class in /src/components/EmberSystem.ts with position, velocity, life, size properties        |           |      |
| TASK-039  | Implement Points geometry with BufferGeometry for 500-1000 particles                                                |           |      |
| TASK-040  | Create ember vertex shader in /src/shaders/ember.vert.glsl with point size based on distance                       |           |      |
| TASK-041  | Create ember fragment shader in /src/shaders/ember.frag.glsl with circular point sprite                            |           |      |
| TASK-042  | Implement particle spawn system: origin at fire center, random initial velocity (upward + radial)                  |           |      |
| TASK-043  | Add physics: gravity (-0.5), air resistance (0.95 velocity damping), turbulence noise                              |           |      |
| TASK-044  | Implement life-cycle: spawn with life=1.0, decay over 3-5 seconds, respawn when life  0                          |           |      |
| TASK-045  | Add size variation: larger at spawn (0.05-0.1), shrink with age                                                     |           |      |
| TASK-046  | Implement color: bright orange-yellow (0xff6600), fade to dark red (0x3d0000) as life decreases                    |           |      |
| TASK-047  | Set material: PointsMaterial or ShaderMaterial with AdditiveBlending, transparent                                   |           |      |
| TASK-048  | Optimize: Use instanced rendering or geometry attributes for performance                                            |           |      |
| TASK-049  | Add randomized spiral motion pattern for visual interest                                                            |           |      |

### Phase 6: Particle Systems - Smoke
**GOAL-006**: Implement smoke particle system with volumetric appearance and atmospheric behavior

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-050  | Create SmokeParticle class in /src/components/SmokeSystem.ts with position, velocity, life, size, opacity          |           |      |
| TASK-051  | Implement billboard sprites using BufferGeometry with 200-400 particles                                             |           |      |
| TASK-052  | Create smoke vertex shader in /src/shaders/smoke.vert.glsl with billboard rotation to face camera                  |           |      |
| TASK-053  | Create smoke fragment shader with circular gradient and noise-based detail                                          |           |      |
| TASK-054  | Implement spawn system: emit from fire top, initial velocity upward (0.3-0.6), slight randomness                   |           |      |
| TASK-055  | Add turbulence: 3D Simplex noise affecting position over time for wispy effect                                      |           |      |
| TASK-056  | Implement expansion: particles grow from size 0.2 to 1.5 over lifetime (4-6 seconds)                               |           |      |
| TASK-057  | Add rotation: each particle slowly rotates (0.01-0.03 rad/frame) around its center                                 |           |      |
| TASK-058  | Set color: dark gray (0x1a1a1a) with slight brown tint (0x1a1612) for campfire smoke                              |           |      |
| TASK-059  | Implement opacity fade: start at 0.4, fade to 0 over lifetime                                                       |           |      |
| TASK-060  | Set material: transparent, NormalBlending or CustomBlending, depthWrite: false                                      |           |      |
| TASK-061  | Optimize particle update loop with typed arrays for positions                                                       |           |      |

### Phase 7: Lighting System
**GOAL-007**: Create dynamic lighting that simulates fire's flickering illumination on environment

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-062  | Add PointLight at fire center with orange color (0xff6600), intensity 2.0-3.0, decay 2                             |           |      |
| TASK-063  | Implement flickering effect: modulate light intensity using Perlin noise (range 1.5-3.5)                           |           |      |
| TASK-064  | Add subtle position offset for light using noise for more dynamic shadows                                           |           |      |
| TASK-065  | Create ambient light with very low intensity (0.05-0.1) and blue-ish tone (0x0a0a1a) for night atmosphere          |           |      |
| TASK-066  | Add directional moonlight: low intensity (0.15), blue-white (0xaaccff), angle from above and side                  |           |      |
| TASK-067  | Enable shadows for point light: castShadow=true, shadow.mapSize=1024x1024                                          |           |      |
| TASK-068  | Configure shadow camera: near=0.5, far=15, bias=-0.001                                                              |           |      |
| TASK-069  | Set objects to cast/receive shadows appropriately (logs cast, ground receives)                                      |           |      |
| TASK-070  | Optimize: Use shadow radius/samples for softer penumbra                                                             |           |      |

### Phase 8: Post-Processing Pipeline
**GOAL-008**: Implement cinematic post-processing effects for photorealistic final image quality

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-071  | Set up EffectComposer in SceneManager with WebGLRenderTarget                                                        |           |      |
| TASK-072  | Add RenderPass as first pass in composer chain                                                                      |           |      |
| TASK-073  | Implement UnrealBloomPass: strength=1.2, radius=0.7, threshold=0.3 for fire glow                                   |           |      |
| TASK-074  | Add color grading using LUTPass or custom shader: increase warmth, reduce blues, boost mids                         |           |      |
| TASK-075  | Implement depth of field using BokehPass: focus=5.0, aperture=0.00003, maxblur=0.01                                |           |      |
| TASK-076  | Add ChromaticAberrationEffect with subtle offset (0.0002-0.0005) for realism                                       |           |      |
| TASK-077  | Add VignetteEffect: darkness=0.5, offset=0.5 for cinematic framing                                                 |           |      |
| TASK-078  | Implement FXAA or SMAA anti-aliasing pass for smooth edges                                                          |           |      |
| TASK-079  | Add film grain effect with custom shader: grain size 0.5-1.0 for subtle texture                                    |           |      |
| TASK-080  | Configure output encoding: renderer.outputEncoding = sRGBEncoding                                                   |           |      |
| TASK-081  | Add tone mapping: ACESFilmicToneMapping for cinematic look                                                          |           |      |
| TASK-082  | Optimize: Make effects toggleable for performance testing                                                           |           |      |

### Phase 9: Environment & Atmosphere
**GOAL-009**: Add environmental elements for immersive campfire setting

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-083  | Create ground fog using horizontal particle layer: 100-200 particles at y=0-0.5                                    |           |      |
| TASK-084  | Implement fog particles with slow horizontal drift and rotation                                                     |           |      |
| TASK-085  | Set fog color: blue-gray (0x1a1f2e) with high transparency (0.1-0.2 alpha)                                         |           |      |
| TASK-086  | Add scene.fog with FogExp2: color matches ambient, density=0.05 for atmospheric depth                              |           |      |
| TASK-087  | Create star field: small point particles in far background (y > 5, random positions)                               |           |      |
| TASK-088  | Set star colors: white to blue-white, faint alpha (0.3-0.6), twinkling animation                                   |           |      |
| TASK-089  | Add gradient background using custom shader on far plane or scene.background                                        |           |      |
| TASK-090  | Background colors: horizon dark blue (0x0f1419)  zenith darker blue (0x050508)                                    |           |      |
| TASK-091  | Add heat distortion effect above fire using custom refraction shader (optional, performance-dependent)              |           |      |

### Phase 10: Audio System
**GOAL-010**: Integrate spatial audio for fire crackling and ambient forest sounds

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-092  | Create AudioManager class in /src/core/AudioManager.ts using Web Audio API                                          |           |      |
| TASK-093  | Generate procedural fire crackle using noise-based synthesis (no audio files needed)                                |           |      |
| TASK-094  | Implement crackle generator: burst of filtered noise at random intervals (0.5-3 seconds)                            |           |      |
| TASK-095  | Add low-frequency rumble using oscillator at 30-80 Hz for fire bass                                                 |           |      |
| TASK-096  | Create ambient forest sounds: synthesized wind using filtered white noise                                           |           |      |
| TASK-097  | Add positional audio: use Three.js PositionalAudio attached to fire mesh                                            |           |      |
| TASK-098  | Implement user-activated audio: add UI button to enable/disable (autoplay restrictions)                             |           |      |
| TASK-099  | Add volume controls and mute toggle in UI overlay                                                                   |           |      |
| TASK-100  | Optimize: Ensure audio context suspended until user interaction                                                     |           |      |

### Phase 11: UI & Loading System
**GOAL-011**: Create loading screen, performance monitor, and minimal UI controls

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-101  | Create loading screen HTML/CSS in index.html: full-screen overlay with progress bar                                |           |      |
| TASK-102  | Style loading screen: dark background (0x0a0a0a), animated fire icon or text                                       |           |      |
| TASK-103  | Implement LoadingManager in /src/core/LoadingManager.ts tracking resource initialization                           |           |      |
| TASK-104  | Show percentage complete: track shader compilation, geometry generation, scene setup                                |           |      |
| TASK-105  | Add fade-out transition (1-2 seconds) when loading complete                                                         |           |      |
| TASK-106  | Create performance stats overlay: FPS counter, memory usage (development only)                                      |           |      |
| TASK-107  | Add minimal UI controls: audio toggle button (bottom-right corner)                                                  |           |      |
| TASK-108  | Style UI: semi-transparent background, white icons, hover effects                                                   |           |      |
| TASK-109  | Add keyboard shortcuts: 'M' for mute, 'F' for fullscreen, 'H' for hide UI                                          |           |      |
| TASK-110  | Implement fullscreen toggle functionality using Fullscreen API                                                      |           |      |

### Phase 12: Performance Optimization
**GOAL-012**: Optimize rendering performance to achieve 60 FPS target on recommended hardware

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-111  | Implement frustum culling for particle systems (don't update off-screen particles)                                  |           |      |
| TASK-112  | Use GPU instancing for particles where possible (InstancedMesh for embers)                                          |           |      |
| TASK-113  | Optimize shader complexity: remove unnecessary calculations, precompute constants                                   |           |      |
| TASK-114  | Implement LOD system: reduce particle counts based on performance metrics                                           |           |      |
| TASK-115  | Add object pooling for particles to avoid garbage collection                                                        |           |      |
| TASK-116  | Optimize geometry: use indexed BufferGeometry, minimize vertex count                                                |           |      |
| TASK-117  | Batch render calls: combine static geometry where possible                                                          |           |      |
| TASK-118  | Implement texture atlasing if any procedural textures are generated                                                 |           |      |
| TASK-119  | Add performance profiling hooks: measure frame time, GPU time, draw calls                                           |           |      |
| TASK-120  | Create quality settings presets: Low/Medium/High/Ultra affecting particle counts and effects                        |           |      |
| TASK-121  | Implement automatic quality scaling based on frame rate (adaptive performance)                                      |           |      |

### Phase 13: Build & Deployment
**GOAL-013**: Configure production build with optimization and prepare for deployment

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-122  | Configure Vite build settings: minification, tree-shaking, code splitting                                           |           |      |
| TASK-123  | Optimize bundle: analyze with rollup-plugin-visualizer, identify large dependencies                                 |           |      |
| TASK-124  | Enable gzip compression in vite.config.ts using vite-plugin-compression                                             |           |      |
| TASK-125  | Configure asset optimization: inline small assets, hash filenames for caching                                       |           |      |
| TASK-126  | Set up environment variables for development/production modes                                                       |           |      |
| TASK-127  | Add meta tags to index.html: description, Open Graph, Twitter Card for sharing                                      |           |      |
| TASK-128  | Create favicon: simple campfire icon or flame graphic                                                               |           |      |
| TASK-129  | Test production build locally: \
pm run build && npm run preview\                                                 |           |      |
| TASK-130  | Create deployment guide for static hosting (Vercel, Netlify, GitHub Pages)                                          |           |      |
| TASK-131  | Set up GitHub Actions for automated builds (optional)                                                               |           |      |

### Phase 14: Testing & Refinement
**GOAL-014**: Test across browsers and devices, refine visual quality and performance

| Task      | Description                                                                                                         | Completed | Date |
| --------- | ------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| TASK-132  | Test on Chrome, Firefox, Safari, Edge: verify WebGL compatibility and visual consistency                            |           |      |
| TASK-133  | Test on different resolutions: 1920x1080, 2560x1440, 3840x2160                                                      |           |      |
| TASK-134  | Test on various GPUs: entry-level (GTX 1060), mid-range (RTX 3060), high-end (RTX 4080)                             |           |      |
| TASK-135  | Profile performance: identify bottlenecks using Chrome DevTools Performance tab                                      |           |      |
| TASK-136  | Test with integrated graphics: ensure Low quality preset runs smoothly                                               |           |      |
| TASK-137  | Verify fire shader aesthetics: adjust noise parameters, colors, and animation speed for realism                     |           |      |
| TASK-138  | Fine-tune particle systems: adjust spawn rates, velocities, lifetimes for natural look                              |           |      |
| TASK-139  | Refine lighting: balance fire light intensity with ambient for proper contrast                                      |           |      |
| TASK-140  | Optimize post-processing: adjust bloom, DOF, vignette for best visual quality without artifacts                     |           |      |
| TASK-141  | Test audio system: verify crackling sounds natural and ambient is immersive                                         |           |      |
| TASK-142  | Conduct user testing: gather feedback on visual quality and performance                                             |           |      |

## 3. Alternatives

### Alternative Technology Stacks

- **ALT-001**: **Babylon.js instead of Three.js**
  - Pros: Better built-in particle system, more game-engine-like features, excellent documentation
  - Cons: Larger bundle size, less community resources for artistic WebGL projects
  - Recommendation: Three.js is better for this artistic/visual project due to community and examples

- **ALT-002**: **React Three Fiber (R3F) instead of vanilla Three.js**
  - Pros: Declarative component model, easier state management, great ecosystem (@react-three/drei)
  - Cons: Additional React dependency, learning curve if unfamiliar with React
  - Recommendation: Use R3F if comfortable with React; vanilla Three.js for maximum control and performance

- **ALT-003**: **WebGPU instead of WebGL**
  - Pros: Better performance, more modern API, compute shaders
  - Cons: Limited browser support (Chrome 113+, not in Firefox/Safari stable yet as of 2026)
  - Recommendation: Stick with WebGL for broader compatibility; migrate to WebGPU in future

- **ALT-004**: **Unreal Engine Pixel Streaming**
  - Pros: True UE5 rendering quality, access to all UE features
  - Cons: Requires cloud infrastructure, complex setup, latency issues, expensive to scale
  - Recommendation: Not suitable for simple static website; WebGL approach is better

### Alternative Implementation Approaches

- **ALT-005**: **Use pre-made fire textures/sprites instead of volumetric shaders**
  - Pros: Simpler implementation, better performance on low-end devices
  - Cons: Lower visual quality, requires artist or asset acquisition, less dynamic
  - Recommendation: Use shader-based for high fidelity as per requirements

- **ALT-006**: **GPU particle system using compute shaders (WebGL2 Transform Feedback)**
  - Pros: Handle millions of particles, offload physics to GPU
  - Cons: More complex implementation, WebGL2 required
  - Recommendation: Implement in Phase 12 optimization if needed for performance

- **ALT-007**: **Use GaussianSplat or NeRF for photorealistic capture**
  - Pros: Ultimate photorealism from real captured data
  - Cons: Requires capturing real campfire, large file sizes, less customizable
  - Recommendation: Not suitable given "no artists" constraint and desire for procedural

## 4. Dependencies

### NPM Packages
- **DEP-001**: \	hree@^0.160.0\ - Core 3D rendering library
- **DEP-002**: \@types/three@^0.160.0\ - TypeScript definitions for Three.js
- **DEP-003**: \ite@^5.0.0\ - Build tool and dev server
- **DEP-004**: \	ypescript@^5.3.0\ - TypeScript compiler
- **DEP-005**: \postprocessing@^6.34.0\ - Advanced post-processing effects library
- **DEP-006**: \ite-plugin-glsl@^1.2.1\ - Vite plugin for importing GLSL shaders
- **DEP-007**: \simplex-noise@^4.0.1\ - Simplex noise implementation for procedural generation
- **DEP-008**: \ite-plugin-compression@^0.5.1\ - Gzip compression plugin for production

### Browser APIs
- **DEP-009**: WebGL 2.0 (fallback to WebGL 1.0)
- **DEP-010**: Web Audio API for procedural audio generation
- **DEP-011**: Fullscreen API for immersive mode
- **DEP-012**: requestAnimationFrame for smooth animation loop

### Development Dependencies
- **DEP-013**: \@vitejs/plugin-basic-ssl@^1.0.2\ - HTTPS in development (for testing audio autoplay)
- **DEP-014**: \
ollup-plugin-visualizer@^5.12.0\ - Bundle analysis tool
- **DEP-015**: ESLint + Prettier for code quality

### External References
- **DEP-016**: Three.js documentation: https://threejs.org/docs/
- **DEP-017**: GLSL shader reference: https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language
- **DEP-018**: Postprocessing library docs: https://pmndrs.github.io/postprocessing/
- **DEP-019**: Noise algorithms: Book of Shaders (https://thebookofshaders.com/)

## 5. Files

### Configuration Files
- **FILE-001**: \package.json\ - NPM dependencies and scripts
- **FILE-002**: \ite.config.ts\ - Vite build configuration with GLSL plugin
- **FILE-003**: \	sconfig.json\ - TypeScript compiler configuration
- **FILE-004**: \.gitignore\ - Git ignore patterns
- **FILE-005**: \index.html\ - Entry HTML file with canvas and loading screen

### Core Application Files
- **FILE-006**: \src/main.ts\ - Application entry point and initialization
- **FILE-007**: \src/core/SceneManager.ts\ - Manages Three.js scene, camera, renderer (250 lines)
- **FILE-008**: \src/core/AnimationLoop.ts\ - Animation loop and timing system (100 lines)
- **FILE-009**: \src/core/CameraControls.ts\ - Camera orbit controls wrapper (80 lines)
- **FILE-010**: \src/core/LoadingManager.ts\ - Resource loading and progress tracking (120 lines)
- **FILE-011**: \src/core/AudioManager.ts\ - Audio synthesis and management (200 lines)

### Component Files
- **FILE-012**: \src/components/Fire.ts\ - Fire mesh with custom shader (150 lines)
- **FILE-013**: \src/components/EmberSystem.ts\ - Ember particle system (250 lines)
- **FILE-014**: \src/components/SmokeSystem.ts\ - Smoke particle system (250 lines)
- **FILE-015**: \src/components/RockGenerator.ts\ - Procedural rock generation (180 lines)
- **FILE-016**: \src/components/LogGenerator.ts\ - Procedural log generation (150 lines)
- **FILE-017**: \src/components/Environment.ts\ - Ground, fog, stars (200 lines)
- **FILE-018**: \src/components/LightingSystem.ts\ - Dynamic lighting management (150 lines)

### Shader Files
- **FILE-019**: \src/shaders/fire.vert.glsl\ - Fire vertex shader (30 lines)
- **FILE-020**: \src/shaders/fire.frag.glsl\ - Fire fragment shader with noise (120 lines)
- **FILE-021**: \src/shaders/ember.vert.glsl\ - Ember particle vertex shader (40 lines)
- **FILE-022**: \src/shaders/ember.frag.glsl\ - Ember particle fragment shader (60 lines)
- **FILE-023**: \src/shaders/smoke.vert.glsl\ - Smoke particle vertex shader (50 lines)
- **FILE-024**: \src/shaders/smoke.frag.glsl\ - Smoke particle fragment shader (80 lines)
- **FILE-025**: \src/shaders/noise.glsl\ - Reusable noise functions library (100 lines)
- **FILE-026**: \src/shaders/background.frag.glsl\ - Gradient background shader (40 lines)

### Utility Files
- **FILE-027**: \src/utils/MathUtils.ts\ - Math helpers (random, lerp, clamp) (100 lines)
- **FILE-028**: \src/utils/PerformanceMonitor.ts\ - FPS and performance tracking (120 lines)
- **FILE-029**: \src/utils/NoiseGenerator.ts\ - Simplex noise wrapper (80 lines)

### Style Files
- **FILE-030**: \src/styles/main.css\ - Global styles, loading screen, UI (200 lines)
- **FILE-031**: \src/styles/ui.css\ - UI controls and overlays (100 lines)

## 6. Testing

### Visual Quality Tests
- **TEST-001**: **Fire Realism Test**: Fire should have realistic colors (redorangeyellowwhite gradient), dynamic motion, and volumetric appearance. No flat or sprite-like artifacts.
- **TEST-002**: **Particle Behavior Test**: Embers should float upward with natural physics (gravity, air resistance, turbulence). Smoke should expand and dissipate naturally.
- **TEST-003**: **Lighting Test**: Fire light should realistically illuminate rocks and logs with flickering shadows. Color temperature should be warm and consistent.
- **TEST-004**: **Post-Processing Test**: Bloom should add glow without over-saturation. DOF should create cinematic focus. No banding or artifacts in effects.

### Performance Tests
- **TEST-005**: **60 FPS Target**: On RTX 3060 / M1 Mac @ 1920x1080, maintain 60 FPS with all effects enabled (Ultra preset).
- **TEST-006**: **30 FPS Minimum**: On integrated graphics (Intel Iris Xe) @ 1920x1080, maintain 30+ FPS on Low preset.
- **TEST-007**: **Load Time Test**: Initial load and scene setup should complete in under 3 seconds on broadband connection (50 Mbps+).
- **TEST-008**: **Memory Leak Test**: Run for 5 minutes, memory usage should stabilize under 512MB with no continuous growth.

### Browser Compatibility Tests
- **TEST-009**: **Chrome Test**: Verify all features work on Chrome 120+ (Windows, macOS, Linux).
- **TEST-010**: **Firefox Test**: Verify rendering consistency on Firefox 120+ (may have slight shader differences).
- **TEST-011**: **Safari Test**: Test on Safari 17+ (macOS/iOS), verify WebGL 2.0 support and correct rendering.
- **TEST-012**: **Edge Test**: Verify on Edge 120+ (Chromium-based, should match Chrome).

### Functional Tests
- **TEST-013**: **Audio Toggle Test**: Audio should start muted, enable on user click, toggle on/off correctly.
- **TEST-014**: **Camera Controls Test**: Orbit controls should rotate around campfire, zoom in/out, with limits preventing ground clipping.
- **TEST-015**: **Fullscreen Test**: Fullscreen toggle should work on supported browsers without layout issues.
- **TEST-016**: **Responsive Test**: Canvas should resize correctly on window resize without distortion or performance drop.

### Shader Tests
- **TEST-017**: **Shader Compilation Test**: All shaders compile without errors on WebGL 2.0 and WebGL 1.0 (with fallbacks).
- **TEST-018**: **Noise Function Test**: Simplex noise should be continuous, seamless, and performant (no visible patterns or artifacts).

## 7. Risks & Assumptions

### Technical Risks
- **RISK-001**: **Shader Performance Variability**: Complex noise-based shaders may perform poorly on integrated graphics. *Mitigation*: Implement quality presets with simplified shaders for Low setting.
- **RISK-002**: **Browser Shader Compiler Differences**: GLSL may compile differently across browsers leading to visual inconsistencies. *Mitigation*: Test on all major browsers, use cross-platform shader patterns.
- **RISK-003**: **Particle System Overhead**: Too many particles may cause frame drops. *Mitigation*: Implement adaptive quality scaling, object pooling, and frustum culling.
- **RISK-004**: **WebGL Context Loss**: Mobile devices or background tabs may lose WebGL context. *Mitigation*: Implement context restoration handlers.
- **RISK-005**: **Post-Processing Performance**: Heavy bloom and DOF may drop FPS significantly. *Mitigation*: Make effects toggleable, reduce effect resolution/quality on lower settings.

### Visual Quality Risks
- **RISK-006**: **Unrealistic Fire Appearance**: Procedural fire may look "CG" or fake without proper tuning. *Mitigation*: Reference real campfire photos/videos, iterate on shader parameters extensively.
- **RISK-007**: **Repetitive Patterns**: Noise-based effects may show repeating patterns over time. *Mitigation*: Use FBM (multiple octaves), vary noise seeds, add temporal variation.
- **RISK-008**: **Lighting Imbalance**: Fire may be too bright or too dim relative to environment. *Mitigation*: Calibrate lighting in phases, test in different scenarios.

### Project Risks
- **RISK-009**: **Scope Creep**: Feature additions (VR, multiplayer, customization) could expand scope. *Mitigation*: Stick strictly to core campfire experience for v1.0.
- **RISK-010**: **Optimization Time**: Performance optimization may take longer than expected. *Mitigation*: Profile early and often, prioritize P0 optimizations.

### Assumptions
- **ASSUMPTION-001**: Target audience has modern hardware (2020+ GPUs) and browsers (2023+ versions).
- **ASSUMPTION-002**: Users access via desktop/laptop, not mobile (mobile support is out of scope for v1.0).
- **ASSUMPTION-003**: Users have JavaScript enabled and accept WebGL rendering.
- **ASSUMPTION-004**: No need for accessibility features (screen readers, keyboard navigation beyond basic controls) in v1.0.
- **ASSUMPTION-005**: Static hosting is sufficient; no backend or database needed.
- **ASSUMPTION-006**: Procedural approach can achieve sufficient visual quality without 3D models or texture artists.
- **ASSUMPTION-007**: Audio can be procedurally generated with acceptable quality using Web Audio API.

## 8. Related Specifications / Further Reading

### Three.js Resources
- Three.js Official Documentation: https://threejs.org/docs/
- Three.js Examples: https://threejs.org/examples/
- Three.js Fundamentals: https://threejs.org/manual/

### Shader Programming
- The Book of Shaders: https://thebookofshaders.com/
- Shadertoy (fire shader examples): https://www.shadertoy.com/results?query=fire
- Inigo Quilez Articles (noise, rendering): https://iquilezles.org/articles/
- WebGL2 Fundamentals: https://webgl2fundamentals.org/

### Particle Systems
- Three.js Points Documentation: https://threejs.org/docs/#api/en/objects/Points
- GPU Particles Tutorial: https://threejs.org/examples/#webgl_gpgpu_birds

### Post-Processing
- postprocessing Library: https://pmndrs.github.io/postprocessing/
- Three.js Post-Processing Examples: https://threejs.org/examples/?q=post

### Inspiration Sites
- Lusion.co (referenced): https://lusion.co - High-end WebGL agency work
- iLab Solutions (referenced): https://www.ilabsolutions.it/ - UE5-quality web experiences
- Awwwards WebGL Collection: https://www.awwwards.com/websites/webgl/

### Performance Optimization
- Three.js Performance Tips: https://discoverthreejs.com/tips-and-tricks/
- WebGL Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices

### Noise Algorithms
- Understanding Perlin Noise: https://adrianb.io/2014/08/09/perlinnoise.html
- Simplex Noise Explained: https://weber.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf

### Audio Synthesis
- Web Audio API Guide: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Procedural Audio for Games: http://www.procedural-audio.com/
