import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { buildAll } from './build-npm-packages.ts';
import { resolvePackageFromTag } from './lib/resolve-package-from-tag.ts';

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

  console.log(`Publishing ${built.name}@${built.version} from ${target.dir}`);
  execFileSync('npm', ['publish'], { cwd: target.dir, stdio: 'inherit' });
}

main();
