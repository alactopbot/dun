"""Render deterministic DUN backgrounds, model-bound posters, and thumbnails."""

import math
import json
import os
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector


PALETTES = {
    "triceratops": ((0.79, 0.81, 0.72, 1), (0.31, 0.40, 0.32, 1), (0.71, 0.53, 0.36, 1)),
    "stegosaurus": ((0.84, 0.78, 0.66, 1), (0.35, 0.43, 0.31, 1), (0.61, 0.40, 0.29, 1)),
    "tyrannosaurus": ((0.75, 0.78, 0.70, 1), (0.29, 0.37, 0.30, 1), (0.64, 0.46, 0.32, 1)),
    "smilodon": ((0.78, 0.80, 0.74, 1), (0.33, 0.38, 0.32, 1), (0.68, 0.52, 0.38, 1)),
}


def material(name, color):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = color
    mat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
    return mat


def look_at(camera, point):
    camera.rotation_euler = (Vector(point) - camera.location).to_track_quat("-Z", "Y").to_euler()


def add_environment(animal_id, portrait):
    sky, foliage, clay = PALETTES[animal_id]
    if bpy.context.scene.world is None:
        bpy.context.scene.world = bpy.data.worlds.new("DUN quiet sky")
    bpy.context.scene.world.color = sky[:3]
    world = bpy.context.scene.world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = sky
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.65

    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -0.025))
    bpy.context.object.data.materials.append(material("quiet earth", (0.56, 0.49, 0.36, 1)))

    # Abstract, low-detail vegetation and stones: atmosphere, not evidence.
    placements = [(-5.5, 3.7, 1.0), (5.2, 4.2, 0.8), (-7.0, -0.5, 0.55), (6.4, -1.0, 0.6)]
    if portrait:
        placements = [(-3.0, 3.6, 1.0), (3.1, 4.1, 0.8), (-3.7, -0.6, 0.5), (3.8, -0.8, 0.55)]
    for index, (x, y, scale) in enumerate(placements):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=scale, location=(x, y, scale * 0.45))
        obj = bpy.context.object
        obj.scale.z = 0.55
        obj.data.materials.append(material(f"stone-{index}", clay if index % 2 else foliage))


def model_points(objects):
    return [obj.matrix_world @ Vector(corner) for obj in objects if obj.type == "MESH" for corner in obj.bound_box]


def model_bounds(objects):
    points = model_points(objects)
    minimum = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    maximum = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return minimum, maximum


def enforce_camera_margin(camera, objects, target, margin=0.08):
    """Move the camera back until every model bound is safely inside frame."""
    scene = bpy.context.scene
    points = model_points(objects)
    for attempt in range(20):
        bpy.context.view_layer.update()
        projected = [world_to_camera_view(scene, camera, point) for point in points]
        bounds = (
            min(point.x for point in projected),
            max(point.x for point in projected),
            min(point.y for point in projected),
            max(point.y for point in projected),
        )
        if bounds[0] >= margin and bounds[1] <= 1 - margin and bounds[2] >= margin and bounds[3] <= 1 - margin:
            print(f"DUN_FRAMING=attempts:{attempt} bounds:{tuple(round(value, 4) for value in bounds)} margin:{margin}")
            return
        camera.location = target + (camera.location - target) * 1.12
        look_at(camera, target)
    raise SystemExit(f"model cannot be framed with margin {margin}: {bounds}")


def setup_camera(objects, width, height, presentation):
    minimum, maximum = model_bounds(objects)
    center = (minimum + maximum) / 2
    size = maximum - minimum
    camera_data = bpy.data.cameras.new("DUN presentation camera")
    camera_data.sensor_fit = "VERTICAL"
    camera_data.sensor_height = 32
    camera_data.lens = 32 / (2 * math.tan(math.radians(presentation["cameraFov"]) / 2))
    camera = bpy.data.objects.new("DUN presentation camera", camera_data)
    bpy.context.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    aspect = width / height
    horizontal_padding = 0.9 if aspect < 1 else 1.35
    framing_height = max(size.z * 1.65, size.x / aspect * horizontal_padding, 1.0)
    distance = (framing_height / 2) / math.tan(math.radians(presentation["cameraFov"]) / 2)
    direction = Vector(presentation["cameraDirection"]).normalized()
    target = center + Vector((0, 0, size.z * 0.03))
    camera.location = center + direction * distance * presentation.get("cameraDistanceFactor", 1.75)
    look_at(camera, target)
    enforce_camera_margin(camera, objects, target)
    print(f"DUN_CAMERA=size:{tuple(round(v, 3) for v in size)} center:{tuple(round(v, 3) for v in center)} location:{tuple(round(v, 3) for v in camera.location)}")
    return camera


def add_lights(camera):
    for name, energy, size, offset in [
        ("soft key", 950, 5.0, (2.5, -3.0, 6.5)),
        ("quiet fill", 420, 4.0, (-4.0, 1.5, 3.5)),
    ]:
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.shape, data.size = energy, "DISK", size
        light = bpy.data.objects.new(name, data)
        bpy.context.collection.objects.link(light)
        light.location = camera.location + Vector(offset)
        look_at(light, (0, 0, 1))


def render(path, width, height, quality=88):
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.quality = quality
    scene.render.filepath = path
    scene.render.film_transparent = False
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.look = "AgX - Medium High Contrast"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.render.render(write_still=True)


def build_scene(model_path, animal_id, portrait, presentation):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=model_path)
    for helper in [obj for obj in bpy.context.scene.objects if obj.type == "MESH" and obj.parent is None and not obj.data.materials]:
        bpy.data.objects.remove(helper, do_unlink=True)
    model_objects = list(bpy.context.scene.objects)
    add_environment(animal_id, portrait)
    width, height = ((720, 1280) if portrait else (1280, 720))
    bpy.context.scene.render.resolution_x = width
    bpy.context.scene.render.resolution_y = height
    bpy.context.scene.render.resolution_percentage = 100
    camera = setup_camera(model_objects, width, height, presentation)
    add_lights(camera)
    return model_objects, width, height


def main():
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) != 4:
        raise SystemExit("usage: render_previews.py MODEL.glb OUTPUT_DIR ANIMAL_ID PRESENTATION.json")
    model_path, output_dir, animal_id, presentation_path = args
    with open(presentation_path, "r", encoding="utf-8") as handle:
        presentation = json.load(handle)
    for portrait in (False, True):
        model_objects, width, height = build_scene(model_path, animal_id, portrait, presentation)
        suffix = "portrait" if portrait else "landscape"
        for obj in model_objects:
            obj.hide_render = True
        render(os.path.join(output_dir, "backgrounds", f"{suffix}.webp"), width, height, 84)
        for obj in model_objects:
            obj.hide_render = False
        render(os.path.join(output_dir, "images", f"poster-{suffix}.webp"), width, height, 88)

    model_objects, _, _ = build_scene(model_path, animal_id, False, presentation)
    render(os.path.join(output_dir, "images", "thumbnail.webp"), 320, 320, 86)
    print(f"DUN_PREVIEWS={output_dir}")


main()
