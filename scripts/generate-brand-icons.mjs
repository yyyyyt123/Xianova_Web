import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
import React from "react";

// Render the official emblem through a square viewport. The source artwork is unchanged.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
let temporaryRenderer;
async function renderer() {
  if (process.platform !== "win32") return (await import("next/og.js")).ImageResponse;
  // Next 14's standalone OG bundle joins file URLs using Windows filesystem rules.
  // Resolve its three assets in a temporary copy; installed dependencies stay untouched.
  const bundle = require.resolve("next/dist/compiled/@vercel/og/index.node.js");
  let source = await readFile(bundle, "utf8");
  for (const asset of ["noto-sans-v27-latin-regular.ttf", "yoga.wasm", "resvg.wasm"]) {
    const absoluteUrl = pathToFileURL(path.join(path.dirname(bundle), asset)).href;
    source = source.replace(`fileURLToPath(join(import.meta.url, "../${asset}"))`, `fileURLToPath(${JSON.stringify(absoluteUrl)})`);
  }
  const scratch = path.join(root, "runtime-logs", "brand-icons");
  await mkdir(scratch, { recursive: true });
  temporaryRenderer = path.join(scratch, "og-renderer.mjs");
  await writeFile(temporaryRenderer, source);
  return (await import(pathToFileURL(temporaryRenderer).href)).ImageResponse;
}
const ImageResponse = await renderer();
const source = `data:image/png;base64,${(await readFile(path.join(root, "public/logo.png"))).toString("base64")}`;
const crop = { left: 126, top: 162, size: 304 };

async function render(size) {
  const scale = size / crop.size;
  const response = new ImageResponse(React.createElement("div", {
    style: { position: "relative", display: "flex", overflow: "hidden", width: size, height: size, backgroundColor: "#fcfcfa", borderRadius: "50%" },
  }, React.createElement("img", {
    src: source,
    width: 1600 * scale,
    height: 622 * scale,
    style: { position: "absolute", left: -crop.left * scale, top: -crop.top * scale },
  })), { width: size, height: size });
  return Buffer.from(await response.arrayBuffer());
}

// PNG-compressed ICO entries retain transparency and support standard browser sizes.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, bytes }, index) => {
    const entry = 6 + index * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(bytes.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += bytes.length;
  });
  return Buffer.concat([header, ...images.map(image => image.bytes)]);
}

const small = await render(32);
const large = await render(64);
const apple = await render(180);
const favicon = ico([{ size: 32, bytes: small }, { size: 64, bytes: large }]);
await Promise.all([
  writeFile(path.join(root, "src/app/favicon.ico"), favicon),
  writeFile(path.join(root, "public/favicon.ico"), favicon),
  writeFile(path.join(root, "public/brand-icon.png"), large),
  writeFile(path.join(root, "public/apple-touch-icon.png"), apple),
]);
console.log("Generated emblem-only browser and touch icons from public/logo.png");
if (temporaryRenderer) await unlink(temporaryRenderer);
