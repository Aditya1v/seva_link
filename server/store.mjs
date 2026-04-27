import { existsSync, mkdirSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createSeedData } from "./seedData.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.RELIEFSYNC_DB_PATH || resolve(__dirname, "data", "db.json");

function ensureDirectory() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(String(password), salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");
  if (storedBuffer.length !== candidate.length) return false;
  return timingSafeEqual(storedBuffer, candidate);
}

export async function loadDb() {
  ensureDirectory();
  if (!existsSync(DB_PATH)) {
    const seed = createSeedData(hashPassword);
    await writeFile(DB_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }

  const raw = await readFile(DB_PATH, "utf8");
  return JSON.parse(raw);
}

export async function saveDb(db) {
  ensureDirectory();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export function createId(prefix) {
  return `${prefix}-${randomBytes(6).toString("hex")}`;
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export function nowIso() {
  return new Date().toISOString();
}
