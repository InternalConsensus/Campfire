# Campfire Project - Repository Instructions

## Project Overview
A high-fidelity, photorealistic WebGL campfire website using Three.js. Everything is procedural - no 3D models, no texture files. Goal: UE5-quality visuals in a browser.

## Tech Stack
- **Framework**: Three.js r160+ (WebGL)
- **Build**: Vite 5.x + TypeScript 5.x  
- **Shaders**: Custom GLSL (vite-plugin-glsl)
- **Post-Processing**: postprocessing library
- **Audio**: Web Audio API (procedural synthesis)

## Build Commands
```bash
# Development
npm run dev

# Production build  
npm run build

# Type checking
npm run typecheck
```

## Code Conventions
### TypeScript
- Strict mode enabled
- Use explicit types, avoid `any`
- Prefer `readonly` for immutable properties

### Three.js Patterns
- Always dispose geometries/materials when removing objects
- Use `Clock` for delta time
- Use `AdditiveBlending` for fire/embers

### GLSL Shaders
- Prefix uniforms with `u` (uTime)
- Prefix varyings with `v` (vUv)
- Comment all uniforms

## Implementation Plan
See `plan/feature-campfire-experience-1.md` for the 14-phase, 142-task plan.

## Agents
Use specialized agents from `.github/agents/` for each task domain.
