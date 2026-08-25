# Runtime processing report

DUN imported Sketchfab's official downloadable GLB into Blender 5.2 LTS with script auto-execution disabled. `scripts/assets/normalize_sketchfab.py` centered the top-level scene in the ground plane and placed the lowest mesh point at ground height; geometry and materials were not edited. Offline review found no prohibited content or external dependency. DUN regenerated the poster and thumbnail from the normalized GLB and checked-in presentation data.

Khronos glTF Validator reports 0 errors and 0 warnings. Runtime metrics: 5,095,012 bytes, 7,164 triangles, 2 draw calls, 5 embedded textures with a maximum dimension of 2048 pixels, and no animation.

Runtime SHA-256: `659f6d9218da0f170d9f95e0a635fff456ee106808fc11e6e514ac9b85150a6a`. The original download SHA-256 remains `94ce54a32b2e3fe5aa1d296db61f843c0b8a266430a70e00ce94537356fda0ef`.
