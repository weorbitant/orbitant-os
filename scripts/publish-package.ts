import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildAll } from './build-npm-packages.ts';
import { resolvePackageFromTag } from './lib/resolve-package-from-tag.ts';
import { SCOPE, META } from './lib/npm-packages.config.ts';

// Returns the pinned dependencies that are NOT yet available in the registry, per the injected
// checker. Publishing the meta while any of these is missing creates a package that no consumer
// can install (`npm install @weorbitant/orbitant-os` fails to resolve), so callers must fail-closed
// on a non-empty result. Pure + checker-injected so it is unit-testable without a live registry.
export function missingDependencies(
  dependencies: Record<string, string>,
  isPublished: (name: string, version: string) => boolean,
): string[] {
  return Object.entries(dependencies)
    .filter(([name, version]) => !isPublished(name, version))
    .map(([name, version]) => `${name}@${version}`);
}

function isPublishedViaNpmView(name: string, version: string): boolean {
  try {
    const out = execFileSync('npm', ['view', `${name}@${version}`, 'version'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

function main() {
  const tag = process.argv[2];
  if (!tag) {
    console.error('Usage: publish-package.ts <git-tag>');
    process.exit(1);
  }

  const target = resolvePackageFromTag(tag);
  if (!target) {
    console.error(`Tag "${tag}" is not a package release tag (expected orbitant-<name>-v<semver>). Skipping.`);
    process.exit(1);
  }

  buildAll();

  const pkgJsonPath = path.join(target.dir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`No built package at ${target.dir} for ${target.pkgName}.`);
    process.exit(1);
  }

  const built = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  if (built.version !== target.version) {
    console.error(`Tag version ${target.version} does not match built ${built.name}@${built.version}. Bump plugin.json / config before tagging.`);
    process.exit(1);
  }

  // Meta preflight: its pinned vertical deps must already exist in the registry, or the published
  // meta is uninstallable for everyone. Fail-closed — publish the vertical packages first.
  if (built.name === `${SCOPE}/${META.name}` && built.dependencies) {
    const missing = missingDependencies(built.dependencies, isPublishedViaNpmView);
    if (missing.length > 0) {
      console.error(`Refusing to publish ${built.name}: dependencies not yet in the registry: ${missing.join(', ')}. Publish the vertical packages first.`);
      process.exit(1);
    }
  }

  console.log(`Publishing ${built.name}@${built.version} from ${target.dir}`);
  execFileSync('npm', ['publish'], { cwd: target.dir, stdio: 'inherit' });
}

// Only run when invoked directly (node scripts/publish-package.ts ...), not when a test imports it.
// pathToFileURL handles paths with spaces/special chars and Windows drives that a raw file:// won't.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
