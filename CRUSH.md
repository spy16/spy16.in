# CRUSH.md - Coding Agent Conventions for spy16.in

## Build, Lint, and Test Commands

- **Development server:**        `pnpm dev` or `pnpm start`
- **Production build:**          `pnpm build`
- **Preview prod build:**        `pnpm preview`
- **Lint/Check:**                `pnpm astro check` (type and linter)
- **Single test:**               _No test scripts found; this repo currently does not appear to have tests._

> **Always use `pnpm`, never `npm` or `yarn`, for installing or running scripts.

## Code Style Guidelines

- **Language:** TypeScript, Astro (.astro), MDX (.mdx, .md)
- **Imports:**
  - Use ES module imports (`import ... from '...'`)
  - Absolute and relative paths both allowed (project uses both styles)
- **Formatting:**
  - Use consistent 2 spaces indentation
  - Prefer trailing commas in multiline lists/objects
  - Single or double quotes are both used; mimic immediate context
- **Types:**
  - Prefer explicit types for exported functions and major variables
  - Use TypeScript’s standard types for primitives, `any` is discouraged
- **Naming conventions:**
  - Filenames: kebab-case for non-TypeScript, camelCase or PascalCase for TypeScript
  - Components: PascalCase (`MyComponent.astro`)
  - Variables and Functions: camelCase
- **Error handling:**
  - Handle async code with try/catch
  - Surface errors early; do not silently swallow errors
- **Directory Structure:**
  - Source under `/src/`; Markdown and contents in `/src/content/`
  - Components: `/src/components/`, layouts: `/src/layouts/`

## Copilot/Cursor
- No Copilot or Cursor rules found in the repo.

## Misc
- Do not add comments or copyright headers unless requested.
- When in doubt, mimic the immediate file context.
- Ignore `.crush/` directory for all agent/coding activity.
