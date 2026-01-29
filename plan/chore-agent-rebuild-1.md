---
goal: Rebuild Agent Infrastructure After Accidental Wipe
version: 1.0
date_created: 2026-01-29
last_updated: 2026-01-29
owner: Brian
status: Completed
tags: [chore, infrastructure]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Rebuild the 12 custom Copilot agents and project instructions after the project directory was accidentally wiped by a previous agent session running `npm create vite@latest .` in a non-empty directory.

## 1. Requirements & Constraints

- **REQ-001**: Recreate all 12 specialized Copilot agents
- **REQ-002**: Use correct `.github/agents/*.agent.md` file format with YAML frontmatter
- **REQ-003**: Include `name`, `description`, and `tools` in frontmatter
- **REQ-004**: Provide domain-specific expertise and code patterns in each agent
- **CON-001**: Original agent files were lost - rebuild from plan specifications

## 2. Implementation Steps

### Phase 1: Agent Infrastructure Rebuild

- GOAL-001: Recreate all 12 specialized Copilot agent files

| Task     | Description                                              | Completed | Date       |
| -------- | -------------------------------------------------------- | --------- | ---------- |
| TASK-001 | Create `.github/agents/` directory                       |         | 2026-01-29 |
| TASK-002 | Create `.github/copilot-instructions.md` (repo-wide)     |         | 2026-01-29 |
| TASK-003 | Create `build-engineer.agent.md` (AGT-001)               |         | 2026-01-29 |
| TASK-004 | Create `threejs-architect.agent.md` (AGT-002)            |         | 2026-01-29 |
| TASK-005 | Create `shader-developer.agent.md` (AGT-003)             |         | 2026-01-29 |
| TASK-006 | Create `particle-engineer.agent.md` (AGT-004)            |         | 2026-01-29 |
| TASK-007 | Create `vfx-artist.agent.md` (AGT-005)                   |         | 2026-01-29 |
| TASK-008 | Create `procedural-specialist.agent.md` (AGT-006)        |         | 2026-01-29 |
| TASK-009 | Create `lighting-expert.agent.md` (AGT-007)              |         | 2026-01-29 |
| TASK-010 | Create `audio-engineer.agent.md` (AGT-008)               |         | 2026-01-29 |
| TASK-011 | Create `ui-developer.agent.md` (AGT-009)                 |         | 2026-01-29 |
| TASK-012 | Create `performance-optimizer.agent.md` (AGT-010)        |         | 2026-01-29 |
| TASK-013 | Create `qa-tester.agent.md` (AGT-011)                    |         | 2026-01-29 |
| TASK-014 | Create `devops-engineer.agent.md` (AGT-012)              |         | 2026-01-29 |

## 3. Alternatives

- **ALT-001**: Could have stored agents in `.github/copilot-instructions/agents/` subfolder (old format)
- **ALT-002**: Used `.github/agents/*.agent.md` format (current GitHub Copilot standard) 

## 4. Dependencies

- **DEP-001**: GitHub Copilot custom instructions feature enabled
- **DEP-002**: VS Code with GitHub Copilot extension

## 5. Files

| File ID  | Path                                                   | Purpose                        |
| -------- | ------------------------------------------------------ | ------------------------------ |
| FILE-001 | `.github/copilot-instructions.md`                      | Repository-wide instructions   |
| FILE-002 | `.github/agents/build-engineer.agent.md`               | Vite/TypeScript build expert   |
| FILE-003 | `.github/agents/threejs-architect.agent.md`            | Three.js scene architecture    |
| FILE-004 | `.github/agents/shader-developer.agent.md`             | GLSL shader programming        |
| FILE-005 | `.github/agents/particle-engineer.agent.md`            | Particle systems               |
| FILE-006 | `.github/agents/vfx-artist.agent.md`                   | Post-processing effects        |
| FILE-007 | `.github/agents/procedural-specialist.agent.md`        | Procedural geometry            |
| FILE-008 | `.github/agents/lighting-expert.agent.md`              | Lighting and materials         |
| FILE-009 | `.github/agents/audio-engineer.agent.md`               | Web Audio API                  |
| FILE-010 | `.github/agents/ui-developer.agent.md`                 | HTML/CSS UI                    |
| FILE-011 | `.github/agents/performance-optimizer.agent.md`        | Performance tuning             |
| FILE-012 | `.github/agents/qa-tester.agent.md`                    | Testing and QA                 |
| FILE-013 | `.github/agents/devops-engineer.agent.md`              | Build and deployment           |

## 6. Testing

- **TEST-001**: Verify agents appear in Copilot chat with @agent-name
- **TEST-002**: Test each agent responds with domain-specific knowledge
- **TEST-003**: Confirm tools specified in frontmatter are available

## 7. Risks & Assumptions

- **RISK-001**: Agent behavior depends on Copilot interpreting instructions correctly
- **ASSUMPTION-001**: GitHub Copilot custom agents feature is enabled in VS Code

## 8. Related Specifications / Further Reading

- [GitHub Copilot Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [feature-campfire-experience-1.md](feature-campfire-experience-1.md) - Main implementation plan
