import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAllPlugins } from '../../../scripts/lib/parse-plugin.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.resolve(__dirname, '../../../plugins');
const OUTPUT_DIR = path.resolve(__dirname, '../content/generated');

function main() {
  console.log('Parsing plugins...');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const parsed = parseAllPlugins(PLUGINS_DIR);

  const plugins = parsed.map((p) => ({
    name: p.name,
    version: p.version,
    description: p.description,
    skills: p.skills.map((s) => ({
      name: s.name,
      folder: s.folder,
      description: s.description,
      version: s.version,
      tags: s.tags,
      plugin: p.name,
    })),
    commands: p.commands.map((c) => ({
      name: c.name,
      description: c.description,
      plugin: p.name,
    })),
    agents: p.agents.map((a) => ({
      name: a.name,
      description: a.description,
      allowedTools: a.allowedTools,
      plugin: p.name,
    })),
  }));

  const skills = plugins.flatMap((p) => p.skills);
  const commands = plugins.flatMap((p) => p.commands);
  const agents = plugins.flatMap((p) => p.agents);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'plugins.json'), JSON.stringify(plugins, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'skills.json'), JSON.stringify(skills, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'commands.json'), JSON.stringify(commands, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'agents.json'), JSON.stringify(agents, null, 2));

  console.log(
    `\nGenerated ${plugins.length} plugins, ${skills.length} skills, ${commands.length} commands, ${agents.length} agents`,
  );
  console.log(`Output written to: ${OUTPUT_DIR}`);
}

main();
