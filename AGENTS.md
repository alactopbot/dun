# DUN collaboration guide

## Project context

DUN is an open prehistoric-animal museum for children aged 2–6 and their caregivers. It supports shared observation,
quiet storytelling, and conversation beyond the screen. Preserve a calm, accessible experience with no accounts, ads,
behavioral tracking, autoplay, surprise effects, competitive scoring, or untraceable content and assets.

Treat `docs/MUSEUM_TECHNICAL_PLAN.md`, `LICENSE`, and `CONTENT-LICENSE.md` as project authority. Child-facing facts,
scientific claims, model provenance, licenses, attribution, and redistribution rights must remain explicit and verifiable.

## Project commands

```bash
# Install dependencies
npm ci

# Test
npm test

# Build
npm run build

# Run locally
npm run dev
```

## Issue Agent Factory

Before requirement work, read `docs/factory/CONTRACT.md` and `docs/factory/CHARTER.md`, then use the applicable workflow
under `.agents/skills/`.

GitHub is the live state; chat history is not authorization. One complete requirement uses one Issue, one deterministic
branch, and one pull request. Ordinary work requires a reviewed Spec. Only a Pattern that users have enabled and selected
with the Issue's unique activation label may skip per-Issue plan review.

Do not create or expand Pattern authority, split internal work into extra process objects, merge, or publish. Run
`./.factory/scripts/gates.sh <fast|full|deep>` for the deterministic verdict; a required skip or misconfiguration is not
green.
