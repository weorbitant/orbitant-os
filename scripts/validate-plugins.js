#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true, strict: false });

const schemaPath = path.join(__dirname, '../.github/schemas/plugin.schema.json');
const pluginsDir = path.join(__dirname, '../plugins');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

let hasErrors = false;

// Find all plugin.json files
const plugins = fs.readdirSync(pluginsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const plugin of plugins) {
  const pluginJsonPath = path.join(pluginsDir, plugin, '.claude-plugin', 'plugin.json');

  if (!fs.existsSync(pluginJsonPath)) {
    console.error(`❌ Missing plugin.json: ${pluginJsonPath}`);
    hasErrors = true;
    continue;
  }

  try {
    const data = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
    const valid = validate(data);

    if (valid) {
      console.log(`✅ ${plugin}/plugin.json`);
    } else {
      console.error(`❌ ${plugin}/plugin.json`);
      for (const err of validate.errors) {
        console.error(`   - ${err.instancePath || '/'}: ${err.message}`);
      }
      hasErrors = true;
    }
  } catch (err) {
    console.error(`❌ ${plugin}/plugin.json - ${err.message}`);
    hasErrors = true;
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log('\n✅ All plugin.json files are valid');
}
