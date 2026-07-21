import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface ParsedSkill {
  name: string;
  folder: string;
  description: string;
  version: string;
  tags: string[];
  content: string;
  frontmatter: Record<string, unknown>;
  relDir: string;
}

export interface ParsedAgent {
  name: string;
  description: string;
  allowedTools?: string;
  content: string;
  frontmatter: Record<string, unknown>;
  relPath: string;
}

export interface ParsedCommand {
  name: string;
  description: string;
  content: string;
  frontmatter: Record<string, unknown>;
  relPath: string;
}

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
