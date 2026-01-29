---
goal: Campfire Project Recovery Status
version: 1.0
date_created: 2026-01-29
last_updated: 2026-01-29
owner: Brian
status: In progress
tags: [chore, infrastructure]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

Status tracker for the Campfire project recovery after accidental directory wipe. This document tracks what has been recovered/rebuilt and what still needs to be done.

## 1. Current Project State

### Recovered/Existing Files

| Component | Status | Notes |
|-----------|--------|-------|
| `package.json` |  Exists | Has correct dependencies (three, postprocessing, vite, typescript, vite-plugin-glsl) |
| `package-lock.json` |  Exists | Dependencies locked |
| `node_modules/` |  Exists | Dependencies installed |
| `src/` folder structure |  Exists | Empty directories: `components/`, `core/`, `shaders/`, `utils/` |
| `plan/feature-campfire-experience-1.md` |  Recovered | 554 lines, 14 phases, 142 tasks |

### Rebuilt Files (This Session)

| Component | Status | Notes |
|-----------|--------|-------|
| `.github/copilot-instructions.md` |  Created | Repository-wide instructions |
| `.github/agents/build-engineer.agent.md` |  Created | AGT-001 |
| `.github/agents/threejs-architect.agent.md` |  Created | AGT-002 |
| `.github/agents/shader-developer.agent.md` |  Created | AGT-003 |
| `.github/agents/particle-engineer.agent.md` |  Created | AGT-004 |
| `.github/agents/vfx-artist.agent.md` |  Created | AGT-005 |
| `.github/agents/procedural-specialist.agent.md` |  Created | AGT-006 |
| `.github/agents/lighting-expert.agent.md` |  Created | AGT-007 |
| `.github/agents/audio-engineer.agent.md` |  Created | AGT-008 |
| `.github/agents/ui-developer.agent.md` |  Created | AGT-009 |
| `.github/agents/performance-optimizer.agent.md` |  Created | AGT-010 |
| `.github/agents/qa-tester.agent.md` |  Created | AGT-011 |
| `.github/agents/devops-engineer.agent.md` |  Created | AGT-012 |

### Missing Files (Still Need to Create)

| Component | Priority | From Plan Phase |
|-----------|----------|-----------------|
| `tsconfig.json` | HIGH | Phase 1, TASK-003 |
| `vite.config.ts` | HIGH | Phase 1, TASK-004 |
| `index.html` | HIGH | Phase 1, TASK-005 |
| `src/main.ts` | HIGH | Phase 1, TASK-006 |
| `src/core/Scene.ts` | HIGH | Phase 1, TASK-007 |
| `src/styles/main.css` | MEDIUM | Phase 1, TASK-008 |
| All shader files | MEDIUM | Phase 2+ |
| All component files | MEDIUM | Phase 3+ |

## 2. Package.json Issues

Current `package.json` needs updates:

```json
// Missing scripts - need to add:
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit"
}

// Wrong main field:
"main": "index.js"  // Should be removed for Vite project

// Wrong type field:
"type": "commonjs"  // Should be "module" for ES modules
```

## 3. Recommended Next Steps

### Immediate (Phase 1 Completion)

1. Fix `package.json` scripts and module type
2. Create `tsconfig.json` (TASK-003)
3. Create `vite.config.ts` with GLSL plugin (TASK-004)
4. Create `index.html` entry point (TASK-005)
5. Create `src/main.ts` bootstrap (TASK-006)
6. Create `src/core/Scene.ts` basic Three.js setup (TASK-007)
7. Verify `npm run dev` works (TASK-012)

### MCP Server Considerations

Researched useful MCP servers:
- **Context7**: Live documentation for Three.js/libraries - could help agents access current API docs
- **Playwright**: Browser automation for visual testing
- **Blender MCP**: 3D visualization (less relevant since we're procedural-only)

## 4. Dependencies

- **DEP-001**: Node.js v20+ installed
- **DEP-002**: npm dependencies already installed

## 5. Related Specifications

- [feature-campfire-experience-1.md](feature-campfire-experience-1.md) - Master implementation plan
- [chore-agent-rebuild-1.md](chore-agent-rebuild-1.md) - Agent rebuild tracking
