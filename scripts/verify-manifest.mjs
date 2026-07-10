#!/usr/bin/env node
/**
 * Consumer-side verification for OpenAnt skills distribution.
 *
 * Verifies that MANIFEST.json was signed by the official OpenAnt release
 * key (Ed25519, pinned below) and that every listed file matches its
 * sha256 hash — i.e. the skills you downloaded are exactly what OpenAnt
 * published, with nothing added, removed, or modified.
 *
 * Usage (from the repo root, standalone — no dependencies):
 *   node scripts/verify-manifest.mjs
 *
 * Exit codes: 0 = verified, 1 = verification failed.
 */

import { createHash, createPublicKey, verify } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Official OpenAnt skills release public key (Ed25519, SPKI base64).
 * Cross-check against SECURITY.md and https://github.com/openant-ai/openant-skills.
 */
const PINNED_PUBLIC_KEY_SPKI_BASE64 =
  "MCowBQYDK2VwAyEAADqogusAPK2ORzYkaC/7mPmEyHFzyu/oSMmnmfZkQWQ=";

function canonicalPayload(manifest) {
  return JSON.stringify({
    schema: manifest.schema,
    signedAt: manifest.signedAt,
    files: manifest.files,
  });
}

const manifestPath = join(ROOT, "MANIFEST.json");
if (!existsSync(manifestPath)) {
  console.error("FAIL: MANIFEST.json not found — unsigned distribution.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

// 1. Signature must come from the pinned key (ignore the key embedded in
//    the manifest — an attacker could swap both the manifest and its key).
const publicKey = createPublicKey({
  key: Buffer.from(PINNED_PUBLIC_KEY_SPKI_BASE64, "base64"),
  format: "der",
  type: "spki",
});
const signatureOk = verify(
  null,
  Buffer.from(canonicalPayload(manifest)),
  publicKey,
  Buffer.from(manifest.signature?.value ?? "", "base64"),
);
if (!signatureOk) {
  console.error("FAIL: manifest signature is invalid (not signed by OpenAnt).");
  process.exit(1);
}

// 2. Every listed file must exist and match its hash.
let mismatches = 0;
for (const { path, sha256: expected } of manifest.files) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    console.error(`FAIL: missing file: ${path}`);
    mismatches++;
    continue;
  }
  const actual = createHash("sha256").update(readFileSync(full)).digest("hex");
  if (actual !== expected) {
    console.error(`FAIL: hash mismatch: ${path}`);
    mismatches++;
  }
}

if (mismatches > 0) {
  console.error(`\nVerification FAILED: ${mismatches} file(s) do not match the signed manifest.`);
  process.exit(1);
}

console.log(
  `OK: signature valid, ${manifest.files.length} files match (signed at ${manifest.signedAt}).`,
);
