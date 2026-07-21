import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pkgRoot = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf-8'));

function keyBy(items, map) {
  const out = {};
  for (const item of items) out[item.name] = map(item);
  return out;
}

export const skills = keyBy(manifest.skills, (s) => ({
  name: s.name,
  folder: s.folder,
  description: s.description,
  version: s.version,
  tags: s.tags,
  content: s.content,
  frontmatter: s.frontmatter,
  dir: path.join(pkgRoot, s.relDir),
}));

export const agents = keyBy(manifest.agents, (a) => ({
  name: a.name,
  description: a.description,
  allowedTools: a.allowedTools,
  content: a.content,
  frontmatter: a.frontmatter,
  path: path.join(pkgRoot, a.relPath),
}));

export const commands = keyBy(manifest.commands, (c) => ({
  name: c.name,
  description: c.description,
  content: c.content,
  frontmatter: c.frontmatter,
  path: path.join(pkgRoot, c.relPath),
}));

export const meta = manifest.meta;

const brain = { skills, agents, commands, meta };
export default brain;
