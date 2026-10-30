#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const NEEDS_TRANSCODING = new Set([
  "mp2", "mogg", "amr", "awb", "wma", "ac3", "eac3", "aifc", "caf", "au", "snd", "gsm",
  "ra", "ram", "voc", "dss", "ds2", "dvf", "msv", "mkv", "avi", "flv", "m2ts", "mts", "ts",
  "3g2", "mpg", "mpeg", "mpegts",
]);

const NATIVE_COMMON = new Set(["mp3", "wav", "m4a", "mp4", "ogg", "webm"]);

function extensionOf(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  return ext === "mp4a" ? "m4a" : ext;
}

function collect(input) {
  const stat = fs.statSync(input);
  if (stat.isDirectory()) {
    return fs.readdirSync(input, { withFileTypes: true }).flatMap((entry) => collect(path.join(input, entry.name)));
  }
  return [input];
}

function probe(file) {
  const ext = extensionOf(file);
  if (NEEDS_TRANSCODING.has(ext)) {
    return { ok: false, message: `${file}: transcode first (.${ext} is in the browser-unrecognized list)` };
  }
  if (NATIVE_COMMON.has(ext)) {
    return { ok: true, message: `${file}: commonly browser-decodable (.${ext})` };
  }
  return { ok: false, message: `${file}: unknown extension (.${ext || "none"}); verify it in a browser before upload` };
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("Usage: node probe.js <file-or-directory> [...more paths]");
  process.exit(1);
}

let failed = false;
for (const input of inputs) {
  try {
    for (const file of collect(path.resolve(input))) {
      const result = probe(file);
      console.log(result.message);
      if (!result.ok) failed = true;
    }
  } catch (error) {
    failed = true;
    console.error(`${input}: cannot inspect (${error.message})`);
  }
}

process.exit(failed ? 1 : 0);
