import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PLUGINS_DIR = path.join(ROOT, 'plugins');
export const DIST_DIR = path.join(ROOT, 'dist', 'npm');

export const SCOPE = '@weorbitant';
export const REGISTRY = 'https://npm.pkg.github.com';

// Meta-package version — single source of truth, bumped here and tagged as orbitant-os-v<version>.
export const META = { name: 'orbitant-os', version: '1.0.0' };

// Relative source paths (repo .gitignore) that must never be published.
export const IGNORED_REL_PATHS = [
  'orbitant-marketing/skills/image-creation/assets/reference',
  'orbitant-marketing/skills/image-creation/output',
  'orbitant-marketing/skills/image-creation/scripts/.env',
];
