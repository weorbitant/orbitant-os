import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PLUGINS_DIR = path.join(ROOT, 'plugins');
export const DIST_DIR = path.join(ROOT, 'dist', 'npm');

export const SCOPE = '@weorbitant';
export const REGISTRY = 'https://npm.pkg.github.com';

// Meta-package name + version live in meta-package.json (single source of truth, like each plugin's
// plugin.json). Bump the version there and tag the release as orbitant-os-v<version>.
export const META: { name: string; version: string } = JSON.parse(
  fs.readFileSync(new URL('./meta-package.json', import.meta.url), 'utf-8'),
);
