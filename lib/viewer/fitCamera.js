import * as THREE from "three";

export const MODEL_FRAME_MARGIN = 0.08;

function boxCorners(box) {
  const { min, max } = box;
  return [
    new THREE.Vector3(min.x, min.y, min.z), new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z), new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z), new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z), new THREE.Vector3(max.x, max.y, max.z),
  ];
}

export function projectedBoxFits(camera, box, margin = MODEL_FRAME_MARGIN) {
  const limit = 1 - margin * 2;
  camera.updateMatrixWorld(true);
  return boxCorners(box).every((corner) => {
    const projected = corner.project(camera);
    return Number.isFinite(projected.x) && Number.isFinite(projected.y) &&
      Math.abs(projected.x) <= limit && Math.abs(projected.y) <= limit &&
      projected.z >= -1 && projected.z <= 1;
  });
}

export function fitProjectedBox(camera, box, target, direction, initialDistance, margin = MODEL_FRAME_MARGIN) {
  let distance = initialDistance;
  const limit = 1 - margin * 2;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    camera.position.copy(target).addScaledVector(direction, distance);
    camera.near = Math.max(distance / 100, 0.01);
    camera.far = distance * 20;
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const projected = boxCorners(box).map((corner) => corner.project(camera));
    const finite = projected.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    const scale = finite
      ? Math.max(...projected.map((point) => Math.max(Math.abs(point.x), Math.abs(point.y)) / limit))
      : Number.POSITIVE_INFINITY;
    if (finite && scale <= 1 && projected.every((point) => point.z >= -1 && point.z <= 1)) return distance;
    if (!finite) break;
    distance *= Math.max(scale * 1.02, 1.05);
  }

  throw new Error("model cannot be framed with margin");
}
