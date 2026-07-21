import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildAll } from './build-npm-packages.ts';
import { resolvePackageFromTag } from './lib/resolve-package-from-tag.ts';
import { SCOPE, META } from './lib/npm-packages.config.ts';

export interface BuiltPackage {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
}

export interface PublishTarget {
  pkgName: string;
  version: string;
  dir: string;
  pkg: BuiltPackage;
}

// Resolve a tag to its staged package and validate the tag version matches what was built — pure
// (no build, no publish), with the package.json read injected, so it is unit-testable without a
// registry or a real build. Throws with an actionable message on any inconsistency.
export function preparePublish(
  tag: string,
  readBuiltPackage: (dir: string) => BuiltPackage,
): PublishTarget {
  const target = resolvePackageFromTag(tag);
  if (!target) {
    throw new Error(`Tag "${tag}" is not a package release tag (expected orbitant-<name>-v<semver>).`);
  }
  const pkg = readBuiltPackage(target.dir);
  if (pkg.version !== target.version) {
    throw new Error(`Tag version ${target.version} does not match built ${pkg.name}@${pkg.version}. Bump plugin.json / config before tagging.`);
  }
  return { pkgName: target.pkgName, version: target.version, dir: target.dir, pkg };
}

// Returns the pinned dependencies that are NOT yet available in the registry, per the injected
// checker. Publishing the meta while any of these is missing creates a package that no consumer
// can install, so callers must fail-closed on a non-empty result. Pure + checker-injected so it is
// unit-testable without a live registry.
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

function readBuiltPackageFromDisk(dir: string): BuiltPackage {
  const pkgJsonPath = path.join(dir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    throw new Error(`No built package at ${dir}.`);
  }
  return JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
}

function main() {
  const tag = process.argv[2];
  if (!tag) {
    console.error('Usage: publish-package.ts <git-tag>');
    process.exit(1);
  }

  buildAll();

  let target: PublishTarget;
  try {
    target = preparePublish(tag, readBuiltPackageFromDisk);
  } catch (err) {
    console.error((err as Error).message);
    process.exit(1);
  }

  const { pkg, dir } = target;

  // Meta preflight: its pinned vertical deps must already exist in the registry, or the published
  // meta is uninstallable for everyone. Fail-closed — publish the vertical packages first.
  if (pkg.name === `${SCOPE}/${META.name}` && pkg.dependencies) {
    const missing = missingDependencies(pkg.dependencies, isPublishedViaNpmView);
    if (missing.length > 0) {
      console.error(`Refusing to publish ${pkg.name}: dependencies not yet in the registry: ${missing.join(', ')}. Publish the vertical packages first.`);
      process.exit(1);
    }
  }

  console.log(`Publishing ${pkg.name}@${pkg.version} from ${dir}`);
  execFileSync('npm', ['publish'], { cwd: dir, stdio: 'inherit' });
}

// Only run when invoked directly (node scripts/publish-package.ts ...), not when a test imports it.
// pathToFileURL handles paths with spaces/special chars and Windows drives that a raw file:// won't.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
