import path from 'node:path';
import { SCOPE, DIST_DIR } from './npm-packages.config.ts';

// Matches orbitant-<name>-v<semver>, e.g. orbitant-marketing-v1.5.0 or orbitant-os-v1.0.0
const TAG_RE = /^(orbitant-[a-z-]+)-v(\d+\.\d+\.\d+)$/;

export function resolvePackageFromTag(tag: string): { pkgName: string; version: string; dir: string } | null {
  const match = TAG_RE.exec(tag);
  if (!match) return null;
  const [, name, version] = match;
  return {
    pkgName: `${SCOPE}/${name}`,
    version,
    dir: path.join(DIST_DIR, SCOPE, name),
  };
}
