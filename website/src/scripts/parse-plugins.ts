import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.resolve(__dirname, '../../../plugins');
const OUTPUT_DIR = path.resolve(__dirname, '../content/generated');

interface SkillFrontmatter {
  name: string;
  description: string;
  version?: string;
  license?: string;
  metadata?: {
    author?: string;
    tags?: string;
  };
}

interface Skill {
  name: string;
  folder: string;
  description: string;
  version: string;
  tags: string[];
  plugin: string;
}

interface Command {
  name: string;
  description: string;
  plugin: string;
}

interface Agent {
  name: string;
  description: string;
  allowedTools?: string;
  plugin: string;
}

interface Plugin {
  name: string;
  version: string;
  description: string;
  skills: Skill[];
  commands: Command[];
  agents: Agent[];
}

interface ParsedData {
  plugins: Plugin[];
  skills: Skill[];
  commands: Command[];
  agents: Agent[];
}

function parseMarkdownFrontmatter<T>(filePath: string): { data: T; content: string } | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    return { data: data as T, content };
  } catch {
    console.warn(`Warning: Could not parse ${filePath}`);
    return null;
  }
}

function parseSkill(skillDir: string, pluginName: string): Skill | null {
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    return null;
  }

  const parsed = parseMarkdownFrontmatter<SkillFrontmatter>(skillMdPath);
  if (!parsed) {
    return null;
  }

  const { data } = parsed;
  const folder = path.basename(skillDir);

  const tagsString = data.metadata?.tags || '';
  const tags = tagsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    name: data.name || `orbitant-${folder}`,
    folder,
    description: typeof data.description === 'string' ? data.description.trim() : '',
    version: data.version || '1.0.0',
    tags,
    plugin: pluginName,
  };
}

function parseCommand(commandPath: string, pluginName: string): Command | null {
  const parsed = parseMarkdownFrontmatter<{ name: string; description: string }>(commandPath);
  if (!parsed) {
    return null;
  }

  const { data } = parsed;
  return {
    name: data.name || path.basename(commandPath, '.md'),
    description: typeof data.description === 'string' ? data.description.trim() : '',
    plugin: pluginName,
  };
}

function parseAgent(agentPath: string, pluginName: string): Agent | null {
  const parsed = parseMarkdownFrontmatter<{
    name: string;
    description: string;
    'allowed-tools'?: string;
  }>(agentPath);
  if (!parsed) {
    return null;
  }

  const { data } = parsed;
  return {
    name: data.name || path.basename(agentPath, '.md'),
    description: typeof data.description === 'string' ? data.description.trim() : '',
    allowedTools: data['allowed-tools'],
    plugin: pluginName,
  };
}

function parsePlugin(pluginDir: string): Plugin | null {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) {
    return null;
  }

  const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
  const pluginName = pluginJson.name;

  // Parse skills
  const skillsDir = path.join(pluginDir, 'skills');
  const skills: Skill[] = [];
  if (fs.existsSync(skillsDir)) {
    const skillFolders = fs.readdirSync(skillsDir);
    for (const skillFolder of skillFolders) {
      const skillPath = path.join(skillsDir, skillFolder);
      if (fs.statSync(skillPath).isDirectory()) {
        const skill = parseSkill(skillPath, pluginName);
        if (skill) {
          skills.push(skill);
        }
      }
    }
  }

  // Parse commands
  const commandsDir = path.join(pluginDir, 'commands');
  const commands: Command[] = [];
  if (fs.existsSync(commandsDir)) {
    const commandFiles = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md'));
    for (const commandFile of commandFiles) {
      const command = parseCommand(path.join(commandsDir, commandFile), pluginName);
      if (command) {
        commands.push(command);
      }
    }
  }

  // Parse agents
  const agentsDir = path.join(pluginDir, 'agents');
  const agents: Agent[] = [];
  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
    for (const agentFile of agentFiles) {
      const agent = parseAgent(path.join(agentsDir, agentFile), pluginName);
      if (agent) {
        agents.push(agent);
      }
    }
  }

  return {
    name: pluginName,
    version: pluginJson.version || '1.0.0',
    description: pluginJson.description || '',
    skills,
    commands,
    agents,
  };
}

function main() {
  console.log('Parsing plugins...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const data: ParsedData = {
    plugins: [],
    skills: [],
    commands: [],
    agents: [],
  };

  // Get all plugin directories
  const pluginDirs = fs.readdirSync(PLUGINS_DIR);

  for (const pluginDirName of pluginDirs) {
    const pluginPath = path.join(PLUGINS_DIR, pluginDirName);
    if (!fs.statSync(pluginPath).isDirectory()) {
      continue;
    }

    const plugin = parsePlugin(pluginPath);
    if (plugin) {
      data.plugins.push(plugin);
      data.skills.push(...plugin.skills);
      data.commands.push(...plugin.commands);
      data.agents.push(...plugin.agents);
      console.log(`  - ${plugin.name}: ${plugin.skills.length} skills, ${plugin.commands.length} commands, ${plugin.agents.length} agents`);
    }
  }

  // Write output files
  fs.writeFileSync(path.join(OUTPUT_DIR, 'plugins.json'), JSON.stringify(data.plugins, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'skills.json'), JSON.stringify(data.skills, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'commands.json'), JSON.stringify(data.commands, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'agents.json'), JSON.stringify(data.agents, null, 2));

  console.log(`\nGenerated ${data.plugins.length} plugins, ${data.skills.length} skills, ${data.commands.length} commands, ${data.agents.length} agents`);
  console.log(`Output written to: ${OUTPUT_DIR}`);
}

main();
