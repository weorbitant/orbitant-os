#!/usr/bin/env node

/**
 * Validates all .fork-metadata.json files against the schema.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ajv = new Ajv({ strict: false });

const schemaPath = path.resolve(__dirname, '../.github/schemas/fork-metadata.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

function findForkMetadataFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...findForkMetadataFiles(fullPath));
    } else if (entry.name === '.fork-metadata.json') {
      results.push(fullPath);
    }
  }

  return results;
}

const rootDir = path.resolve(__dirname, '../plugins');
const metadataFiles = findForkMetadataFiles(rootDir);

if (metadataFiles.length === 0) {
  console.log('No .fork-metadata.json files found (this is OK if no skills are forked)\n');
  process.exit(0);
}

let hasErrors = false;

for (const filePath of metadataFiles) {
  const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(content);

    if (valid) {
      console.log(`✅ ${relativePath}`);
    } else {
      console.log(`❌ ${relativePath}`);
      validate.errors.forEach(err => {
        console.log(`   ${err.instancePath} ${err.message}`);
      });
      hasErrors = true;
    }
  } catch (err) {
    console.log(`❌ ${relativePath}`);
    console.log(`   ${err.message}`);
    hasErrors = true;
  }
}

console.log();

if (hasErrors) {
  console.log('❌ Some .fork-metadata.json files have validation errors\n');
  process.exit(1);
} else {
  console.log('✅ All .fork-metadata.json files are valid\n');
}
