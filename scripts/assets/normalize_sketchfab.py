"""Normalize one reviewed Sketchfab GLB without executing source scripts."""

import os
import sys

import bpy
from mathutils import Vector


def bounds(objects):
    points = [obj.matrix_world @ Vector(corner) for obj in objects if obj.type == "MESH" for corner in obj.bound_box]
    if not points:
        raise RuntimeError("model contains no mesh bounds")
    minimum = Vector((min(point.x for point in points), min(point.y for point in points), min(point.z for point in points)))
    maximum = Vector((max(point.x for point in points), max(point.y for point in points), max(point.z for point in points)))
    return minimum, maximum


def main():
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) != 2:
        raise SystemExit("usage: normalize_sketchfab.py INPUT.glb OUTPUT.glb")
    source, destination = map(os.path.abspath, args)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=source)
    for obj in list(bpy.context.scene.objects):
        if obj.type in {"CAMERA", "LIGHT"}:
            bpy.data.objects.remove(obj, do_unlink=True)
    scene_objects = list(bpy.context.scene.objects)
    minimum, maximum = bounds(scene_objects)
    offset = Vector((-(minimum.x + maximum.x) / 2, -(minimum.y + maximum.y) / 2, -minimum.z))
    for obj in scene_objects:
        if obj.parent is None:
            obj.location += offset
    bpy.context.view_layer.update()
    grounded_minimum, _ = bounds(scene_objects)
    if abs(grounded_minimum.z) > 0.001:
        raise RuntimeError(f"grounding failed: min z {grounded_minimum.z}")
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=destination,
        export_format="GLB",
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_extras=True,
        export_tangents=True,
        export_yup=True,
    )
    print(f"DUN_NORMALIZED=offset:{tuple(round(value, 6) for value in offset)} output:{destination}")


main()
