<!--
Sync Impact Report

Version change: none -> 0.1.0
Modified principles:
 - [placeholder names] -> Specification-First; Reusable Components; Test-First; Integration & Observability; Simplicity & Compatibility
Added sections:
 - Constraints & Compliance
 - Development Workflow
Removed sections:
 - none
Templates requiring updates:
 - .specify/templates/plan-template.md: ⚠ pending
 - .specify/templates/spec-template.md: ⚠ pending
 - .specify/templates/tasks-template.md: ⚠ pending
Follow-up TODOs:
 - TODO(RATIFICATION_DATE): ratification date unknown, please provide
 -->

# GymSpecKit Constitution

## Core Principles

### Specification-First
All feature work MUST begin with a clear, versioned specification in the project's spec format. Specifications are the authoritative contract for design and implementation. Rationale: reduces ambiguity and enables automated validation and reuse.

### Reusable Components
Design artifacts and implementation pieces MUST be modular and reusable. Components SHOULD be published as discrete, documented units with clear inputs/outputs and example usage.

### Test-First (NON-NEGOTIABLE)
Tests or executable validation suites MUST be created alongside specifications and be used to verify compliance before implementation merges. Follow the red-green-refactor cycle for implementation changes.

### Integration & Observability
Integration points and shared schemas MUST include integration tests. All runtime behaviour exposed by specs MUST be observable via structured logs or test harness outputs to support reproducible debugging.

### Simplicity & Compatibility
Prefer the simplest solution that satisfies the specification. Breaking changes to public specs or components MUST follow the versioning policy and include migration guidance.

## Constraints & Compliance
Technology and content constraints:
- Primary spec format: Markdown + YAML frontmatter for metadata.
- Deliverables MUST include examples and at least one machine-checkable validation where applicable.
- Security and data handling requirements (if applicable) MUST be documented in the spec and reviewed on PRs.

## Development Workflow
- All changes MUST be submitted via pull requests and pass CI gates that include spec validation, unit tests, and linting where configured.
- Code review: at least one approving review required for changes to specs; two approvers recommended for breaking changes.
- Versioning: follow semantic versioning for public specs and components; document breaking changes in the PR and release notes.

## Governance
This constitution is the canonical guidance for how specs, tasks, and implementations are produced in this repository. Amendments require a proposal, PR with rationale and migration steps, and approval by project maintainers.

- Amendment procedure: propose change → open PR against `.specify/memory/constitution.md` → include migration/test plan → maintainers approve.
- Versioning policy: MAJOR for backwards-incompatible governance or principle removals; MINOR for new principles or material expansions; PATCH for clarifications, wording, and typos.
- Compliance: PRs touching public specs MUST include a checklist referencing these principles and automated validation results when possible.

**Version**: 0.1.0 | **Ratified**: 2026-06-09 | **Last Amended**: 2026-06-09
