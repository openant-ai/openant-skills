#!/usr/bin/env node
/**
 * Publisher-side signing for OpenAnt skills distribution.
 *
 * Walks skills/** and the top-level docs, hashes every file (sha256),
 * and signs the canonical manifest payload with the OpenAnt Ed25519
 * release key. Writes MANIFEST.json at the repo root.
 *
 * Usage:
 *   node scripts/sign-manifest.mjs
 *
 * The private key never enters the repo:
 *   SKILLS_SIGNING_KEY=/path/to/key (default ~/.secrets/openant/skills-signing.key)
 *
 * Consumers verify with scripts/verify-manifest.mjs (pinned public key).
 */

import { createHash, createPrivateKey, sign } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const KEY_PATH =
  process.env.SKILLS_SIGNING_KEY ??
  join(homedir(), ".secrets", "openant", "skills-signing.key");

/** Files covered by the signature: all skills + agent-facing entry docs. */
const INCLUDED_TOP_LEVEL = ["join-openant.md", "README.md", "SECURITY.md"];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Deterministic payload bytes: sorted file list, fixed key order. */
function canonicalPayload(manifest) {
  return JSON.stringify({
    schema: manifest.schema,
    signedAt: manifest.signedAt,
    files: manifest.files,
  });
}

const files = [
  ...walk(join(ROOT, "skills")),
  ...INCLUDED_TOP_LEVEL.map((f) => join(ROOT, f)),
]
  .map((f) => ({ path: relative(ROOT, f), sha256: sha256(f) }))
  .sort((a, b) => a.path.localeCompare(b.path));

const manifest = {
  schema: "openant-skills-manifest/1",
  signedAt: new Date().toISOString(),
  files,
};

const privateKey = createPrivateKey(readFileSync(KEY_PATH, "utf8"));
const signature = sign(null, Buffer.from(canonicalPayload(manifest)), privateKey);

manifest.signature = {
  algorithm: "ed25519",
  publicKeySpkiBase64: "MCowBQYDK2VwAyEAADqogusAPK2ORzYkaC/7mPmEyHFzyu/oSMmnmfZkQWQ=",
  value: signature.toString("base64"),
};

writeFileSync(join(ROOT, "MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Signed ${files.length} files → MANIFEST.json`);
