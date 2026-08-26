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

Before requirement work, read `docs/factory/CONTRACT.md` and use `factory-run`. One complete requirement uses one Issue,
the deterministic `issue/<number>` branch, one Spec, and one pull request.

Do not implement while the pull request is Draft. A trusted human selecting **Ready for review** authorizes
implementation. Verify the current head with `./.factory/scripts/gates.sh`; later commits require verification again.
Agents do not merge pull requests.
