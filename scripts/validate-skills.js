#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, strict: false });

const schemaPath = path.join(__dirname, '../.github/schemas/skill-frontmatter.schema.json');
const pluginsDir = path.join(__dirname, '../plugins');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

let hasErrors = false;

// Extract YAML frontmatter from markdown
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  return yaml.load(match[1]);
}

// Find all SKILL.md files recursively
function findSkillFiles(dir) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...findSkillFiles(fullPath));
    } else if (item.name === 'SKILL.md') {
      results.push(fullPath);
    }
  }
  return results;
}

const skillFiles = findSkillFiles(pluginsDir);

if (skillFiles.length === 0) {
  console.log('⚠️  No SKILL.md files found');
  process.exit(0);
}

for (const skillPath of skillFiles) {
  const relativePath = path.relative(process.cwd(), skillPath);

  try {
    const content = fs.readFileSync(skillPath, 'utf8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      console.error(`❌ ${relativePath} - No frontmatter found`);
      hasErrors = true;
      continue;
    }

    const valid = validate(frontmatter);

    if (valid) {
      console.log(`✅ ${relativePath}`);
    } else {
      console.error(`❌ ${relativePath}`);
      for (const err of validate.errors) {
        console.error(`   - ${err.instancePath || '/'}: ${err.message}`);
      }
      hasErrors = true;
    }
  } catch (err) {
    console.error(`❌ ${relativePath} - ${err.message}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('\n✅ All SKILL.md frontmatter is valid');
}
