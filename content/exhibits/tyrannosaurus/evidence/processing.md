# Runtime processing report

Processed on 2026-08-25 with Blender 5.2 LTS and `scripts/assets/export_blend.py`. Unknown source scripts were disabled. Because the 2018 source spells its calm action `TRex_Idle` while its mesh is `Trex`, the action was renamed to the exporter's expected `Trex_Idle` in a temporary source copy before running the checked-in exporter with animal ID `trex`.

DUN removed stale external images and Attack, Death, Jump, Run, and Walk actions; retained and renamed the calm clip to `Idle`; rotated the animal to face +X; converted Z-up to glTF +Y-up; scaled, centered, and grounded it; and rebuilt the reviewed flat colours as metallic/roughness materials. The GLB is self-contained and contains no camera, light, text, logo, watermark, or external texture dependency.

Khronos glTF Validator 2.0.0-dev.3.10 reports 0 errors and 0 warnings. Runtime SHA-256: `1887d5378ad1c57a39f13301bcef672d43d27cd5bd06f2cb9f9816cb07649f9f`.
