import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const PLUGINS_DIR = path.join(ROOT, 'plugins');
export const DIST_DIR = path.join(ROOT, 'dist', 'npm');

export const SCOPE = '@orbitant';
export const REGISTRY = 'https://registry.npmjs.org';

// Meta-package name + version live in meta-package.json (single source of truth, like each plugin's
// plugin.json). Bump the version there and tag the release as orbitant-os-v<version>.
export const META: { name: string; version: string } = JSON.parse(
  fs.readFileSync(new URL('./meta-package.json', import.meta.url), 'utf-8'),
);

// Git tags, plugin folders and plugin.json all carry the `orbitant-` prefix. On npm the scope
// already says "orbitant", so the published name drops it and says what the package IS instead —
// a brain, the same word the docs and the aggregate default export already use:
// orbitant-marketing -> brain-marketing, and the meta orbitant-os -> brain.
export function npmName(sourceName: string): string {
  const short = sourceName.replace(/^orbitant-/, '');
  return short === 'os' ? 'brain' : `brain-${short}`;
}
