import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { SkillEntry, AgentEntry, CommandEntry } from '../templates/npm/index.js';

// The parser emits RELATIVE paths (relDir/relPath); the shipped index.js resolves them to the
// ABSOLUTE dir/path at load time. Each Parsed* type is therefore its public *Entry counterpart
// (the single source of truth for the shared fields, shipped in every package) with the
// resolved-path field swapped for the relative one. Type-only import — erased at runtime.
export type ParsedSkill = Omit<SkillEntry, 'dir'> & { relDir: string };
export type ParsedAgent = Omit<AgentEntry, 'path'> & { relPath: string };
export type ParsedCommand = Omit<CommandEntry, 'path'> & { relPath: string };

export interface ParsedPlugin {
  name: string;
  vertical: string;
  version: string;
  description: string;
  skills: ParsedSkill[];
  agents: ParsedAgent[];
  commands: ParsedCommand[];
}

function readFrontmatter(filePath: string): { data: Record<string, unknown>; content: string } | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return { data: data as Record<string, unknown>, content };
  } catch {
    console.warn(`Warning: could not parse ${filePath}`);
    return null;
  }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseSkill(skillDir: string, relDir: string): ParsedSkill | null {
  const skillMd = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return null;
  const parsed = readFrontmatter(skillMd);
  if (!parsed) return null;

  const { data, content } = parsed;
  const folder = path.basename(skillDir);
  const meta = (data.metadata as { tags?: string } | undefined) ?? {};
  const tags = str(meta.tags)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    name: str(data.name) || `orbitant-${folder}`,
    folder,
    description: str(data.description),
    version: str(data.version) || '1.0.0',
    tags,
    content,
    frontmatter: data,
    relDir,
  };
}

function parseAgent(agentPath: string, relPath: string): ParsedAgent | null {
  const parsed = readFrontmatter(agentPath);
  if (!parsed) return null;
  const { data, content } = parsed;
  return {
    name: str(data.name) || path.basename(agentPath, '.md'),
    description: str(data.description),
    allowedTools: str(data['allowed-tools']) || undefined,
    content,
    frontmatter: data,
    relPath,
  };
}

function parseCommand(commandPath: string, relPath: string): ParsedCommand | null {
  const parsed = readFrontmatter(commandPath);
  if (!parsed) return null;
  const { data, content } = parsed;
  return {
    name: str(data.name) || path.basename(commandPath, '.md'),
    description: str(data.description),
    content,
    frontmatter: data,
    relPath,
  };
}

export function parsePlugin(pluginDir: string): ParsedPlugin | null {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) return null;

  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
  const name: string = pluginJson.name;

  // The build and packaging reconstruct disk paths from `name` (copyPluginFiles,
  // assertPluginIntegrity, readPluginJson), so the folder must equal the name. Enforce it here — the
  // one place both are known — rather than let a mismatch ship a package with no content files.
  const folder = path.basename(pluginDir);
  if (folder !== name) {
    throw new Error(`Plugin folder "${folder}" does not match its plugin.json name "${name}"; they must be identical.`);
  }

  const vertical = name.replace(/^orbitant-/, '');

  const skills: ParsedSkill[] = [];
  const skillsDir = path.join(pluginDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir)) {
      const abs = path.join(skillsDir, entry);
      if (!fs.statSync(abs).isDirectory()) continue;
      const skill = parseSkill(abs, path.posix.join('skills', entry));
      if (skill) skills.push(skill);
    }
  }

  const agents: ParsedAgent[] = [];
  const agentsDir = path.join(pluginDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'))) {
      const agent = parseAgent(path.join(agentsDir, file), path.posix.join('agents', file));
      if (agent) agents.push(agent);
    }
  }

  const commands: ParsedCommand[] = [];
  const commandsDir = path.join(pluginDir, 'commands');
  if (fs.existsSync(commandsDir)) {
    for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md'))) {
      const command = parseCommand(path.join(commandsDir, file), path.posix.join('commands', file));
      if (command) commands.push(command);
    }
  }

  return {
    name,
    vertical,
    version: str(pluginJson.version) || '1.0.0',
    description: str(pluginJson.description),
    skills,
    agents,
    commands,
  };
}

export function parseAllPlugins(pluginsDir: string): ParsedPlugin[] {
  const out: ParsedPlugin[] = [];
  for (const entry of fs.readdirSync(pluginsDir)) {
    const abs = path.join(pluginsDir, entry);
    if (!fs.statSync(abs).isDirectory()) continue;
    const plugin = parsePlugin(abs);
    if (plugin) out.push(plugin);
  }
  return out;
}
