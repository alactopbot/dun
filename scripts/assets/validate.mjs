import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateBytes as validateGltfBytes, version as gltfValidatorVersion } from "gltf-validator";

const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const approvedModels = {
  triceratops: { uid: "27fdbc94f05b4e0c844db6fd679b2265", creator: "JZG", originalSha256: "94ce54a32b2e3fe5aa1d296db61f843c0b8a266430a70e00ce94537356fda0ef" },
  stegosaurus: { uid: "9776fff241a54639b184d25a2777f63f", creator: "Billy Jackman", originalSha256: "67a73c5e4fcbf68db94be467f52ef0aef5ad8c29dba647476471253b7988dbc2" },
  tyrannosaurus: { uid: "6465a297fa784598adc49f6e0042d449", creator: "Marcel Schanz", originalSha256: "6d2dee6ffe15e8ea30a87d71a466c14db68220c97f1bed6a8800532196a64705" },
  smilodon: { creator: "DUN project", originalSha256: "01a6a24f7bd4c3406b6b0f994c74ff44a3efb5122dd69383a4702c861ede7f44", license: "CC-BY-SA-4.0" },
};
