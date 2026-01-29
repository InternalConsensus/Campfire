---
applyTo: "**"
---

# Campfire Project Workflow Instructions

When completing a task or phase and asking the user what they want to do next, you MUST:

1. **State which phase comes next** from the implementation plan
2. **Specify the recommended agent** for that phase using the format: `@agent-name`
3. **Briefly describe what that phase involves**

## Phase-to-Agent Mapping

| Phase | Agent | Description |
|-------|-------|-------------|
| Phase 1 | `@build-engineer` | Project setup, Vite, TypeScript, dependencies |
| Phase 2 | `@threejs-architect` | Scene management, camera, renderer, animation loop |
| Phase 3 | `@procedural-specialist` | Rock, log, and ground geometry generation |
| Phase 4 | `@shader-developer` | Fire shader with FBM noise and color ramps |
| Phase 5 | `@particle-engineer` | Ember particle system with physics |
| Phase 6 | `@particle-engineer` | Smoke particle system |
| Phase 7 | `@lighting-expert` | Dynamic lighting and shadows |
| Phase 8 | `@vfx-artist` | Post-processing (bloom, DOF, color grading) |
| Phase 9 | `@procedural-specialist` | Environmental details (ground fog, grass) |
| Phase 10 | `@audio-engineer` | Procedural fire audio synthesis |
| Phase 11 | `@ui-developer` | UI controls, keyboard shortcuts |
| Phase 12 | `@performance-optimizer` | Optimization and quality tiers |
| Phase 13 | `@qa-tester` | Cross-browser testing and QA |
| Phase 14 | `@devops-engineer` | Production build and deployment |

## Example Response Format

When finishing a phase, end with something like:

> **Next up - Phase 3:** Procedural Geometry Generation
> - **Recommended agent:** `@procedural-specialist`
> - Creates rocks with noise displacement, logs in teepee formation, ground plane
>
> Ready to continue?

## Agent Reference

All agents are defined in `.github/agents/`:

- `@build-engineer` - Vite, TypeScript, npm, build configuration
- `@threejs-architect` - Three.js scene, camera, renderer, controls
- `@shader-developer` - GLSL shaders, noise algorithms, WebGL
- `@particle-engineer` - Particle systems, BufferGeometry, physics
- `@vfx-artist` - Post-processing, bloom, DOF, color grading
- `@procedural-specialist` - Procedural geometry, noise displacement
- `@lighting-expert` - Dynamic lighting, shadows, PBR materials
- `@audio-engineer` - Web Audio API, procedural sound synthesis
- `@ui-developer` - HTML/CSS, loading screens, UI controls
- `@performance-optimizer` - Profiling, LOD, memory management
- `@qa-tester` - Cross-browser testing, visual QA
- `@devops-engineer` - Build optimization, deployment, CI/CD
