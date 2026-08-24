"""Convert one reviewed Quaternius Blender source into DUN's runtime GLB.

Run with Blender's --background --factory-startup --disable-autoexec flags. The
source path, output path, and animal id are positional arguments after `--`.
"""

import math
import os
import sys

import bpy
from mathutils import Vector


def main() -> None:
    args = sys.argv[sys.argv.index("--") + 1 :]
    if len(args) != 3:
        raise SystemExit("usage: export_blend.py SOURCE.blend OUTPUT.glb ANIMAL_ID")
    source, output, animal_id = args

    bpy.ops.wm.open_mainfile(filepath=source, load_ui=False, use_scripts=False)

    allowed_objects = {animal_id.capitalize(), "Armature"}
    for obj in list(bpy.data.objects):
        if obj.name not in allowed_objects or obj.type not in {"MESH", "ARMATURE"}:
            bpy.data.objects.remove(obj, do_unlink=True)

    # The reviewed files face Blender -Y. Rotate the complete rig so the final
    # glTF faces +X; Blender's exporter converts Z-up to glTF Y-up.
    armature = next(obj for obj in bpy.data.objects if obj.type == "ARMATURE")
    armature.rotation_euler[2] = math.radians(90)
    armature.scale = (0.2, 0.2, 0.2)
    if armature.mode != "OBJECT":
        bpy.context.view_layer.objects.active = armature
        bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.select_all(action="DESELECT")
    armature.hide_set(False)
    armature.hide_viewport = False
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    for pose_bone in armature.pose.bones:
        pose_bone.custom_shape = None

    # Keep only the calm looping clip, bound directly to the armature.
    idle_name = f"{animal_id.capitalize()}_Idle"
    idle = bpy.data.actions.get(idle_name)
    for action in list(bpy.data.actions):
        if action != idle:
            bpy.data.actions.remove(action)
    if idle is not None:
        idle.name = "Idle"
        if armature.animation_data is None:
            armature.animation_data_create()
        armature.animation_data.action = idle

    # The pack uses flat material colors. Remove stale, unused image paths so
    # the GLB is self-contained and cannot depend on local author files.
    for image in list(bpy.data.images):
        bpy.data.images.remove(image, do_unlink=True)
    palette = {
        "Brown": (0.36, 0.20, 0.09, 1.0),
        "DarkBrown": (0.18, 0.09, 0.04, 1.0),
        "LightBrown": (0.61, 0.40, 0.20, 1.0),
        "Purple": (0.34, 0.18, 0.30, 1.0),
    }
    for mat in bpy.data.materials:
        color = palette.get(mat.name, tuple(mat.diffuse_color))
        mat.use_nodes = True
        mat.node_tree.nodes.clear()
        output_node = mat.node_tree.nodes.new("ShaderNodeOutputMaterial")
        shader = mat.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
        shader.inputs["Base Color"].default_value = color
        shader.inputs["Roughness"].default_value = 0.82
        mat.node_tree.links.new(shader.outputs["BSDF"], output_node.inputs["Surface"])

    # Ground the evaluated mesh and center it horizontally.
    bpy.context.view_layer.update()
    meshes = [obj for obj in bpy.data.objects if obj.type == "MESH"]
    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    min_z = min(point.z for point in corners)
    min_x, max_x = min(p.x for p in corners), max(p.x for p in corners)
    min_y, max_y = min(p.y for p in corners), max(p.y for p in corners)
    armature.location.x -= (min_x + max_x) / 2
    armature.location.y -= (min_y + max_y) / 2
    armature.location.z -= min_z
    bpy.context.view_layer.update()

    # glTF skins already name their joint hierarchy explicitly. Keep the
    # skinned mesh as a scene root so parent transforms cannot be ignored by
    # conforming viewers (Khronos NODE_SKINNED_MESH_NON_ROOT).
    for mesh in meshes:
        world_matrix = mesh.matrix_world.copy()
        mesh.parent = None
        mesh.matrix_world = world_matrix

    os.makedirs(os.path.dirname(output), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=output,
        export_format="GLB",
        export_yup=True,
        export_apply=False,
        export_animations=idle is not None,
        export_animation_mode="ACTIONS",
        export_nla_strips=False,
        export_all_influences=False,
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_unused_images=False,
        export_unused_textures=False,
    )
    print(f"DUN_EXPORT={output}")


main()
