#!/usr/bin/env node

/**
 * Check if upstream repositories have changes since forked skills were created.
 *
 * Usage: node scripts/check-upstream.js [--verbose]
 *
 * Finds all .fork-metadata.json files and checks if the upstream repo
 * has new commits on the tracked files since the forked commit.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERBOSE = process.argv.includes('--verbose');

function log(...args) {
  if (VERBOSE) console.log(...args);
}

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

async function checkUpstreamChanges(metadataPath) {
  const skillDir = path.dirname(metadataPath);
  const skillName = path.basename(skillDir);
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  const { repo, commit, branch = 'main', files } = metadata.upstream;
  const repoMatch = repo.match(/github\.com\/([^/]+\/[^/]+)/);

  if (!repoMatch) {
    return { skillName, error: 'Invalid repo URL' };
  }

  const repoPath = repoMatch[1].replace(/\.git$/, '');

  log(`\nChecking ${skillName}...`);
  log(`  Repo: ${repoPath}`);
  log(`  Forked commit: ${commit.slice(0, 7)}`);

  try {
    // Get latest commit on branch
    const latestCommitCmd = `curl -s "https://api.github.com/repos/${repoPath}/commits/${branch}" | jq -r '.sha'`;
    const latestCommit = execSync(latestCommitCmd, { encoding: 'utf8' }).trim();

    log(`  Latest commit: ${latestCommit.slice(0, 7)}`);

    if (latestCommit === commit) {
      return { skillName, status: 'up-to-date', commit };
    }

    // Check if any tracked files changed
    const changedFiles = [];

    for (const file of files) {
      // Get file history since forked commit
      const compareCmd = `curl -s "https://api.github.com/repos/${repoPath}/commits?path=${encodeURIComponent(file.source)}&sha=${branch}" | jq -r '.[0].sha'`;
      const fileLatestCommit = execSync(compareCmd, { encoding: 'utf8' }).trim();

      log(`  File: ${file.source}`);
      log(`    Latest change: ${fileLatestCommit.slice(0, 7)}`);

      // Check if file was modified after our fork
      const isNewerCmd = `curl -s "https://api.github.com/repos/${repoPath}/compare/${commit}...${fileLatestCommit}" | jq -r '.status'`;
      const compareStatus = execSync(isNewerCmd, { encoding: 'utf8' }).trim();

      if (compareStatus === 'ahead' || compareStatus === 'diverged') {
        changedFiles.push(file.source);
      }
    }

    if (changedFiles.length > 0) {
      return {
        skillName,
        status: 'outdated',
        forkedCommit: commit,
        latestCommit,
        changedFiles,
        compareUrl: `https://github.com/${repoPath}/compare/${commit.slice(0, 7)}...${branch}`
      };
    }

    return { skillName, status: 'up-to-date', commit };

  } catch (error) {
    return { skillName, error: error.message };
  }
}

async function main() {
  console.log('Checking upstream changes for forked skills...\n');

  const rootDir = path.resolve(__dirname, '..');
  const metadataFiles = findForkMetadataFiles(rootDir);

  if (metadataFiles.length === 0) {
    console.log('No forked skills found (.fork-metadata.json files)');
    return;
  }

  console.log(`Found ${metadataFiles.length} forked skill(s)\n`);

  const results = [];
  for (const metadataPath of metadataFiles) {
    const result = await checkUpstreamChanges(metadataPath);
    results.push(result);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60) + '\n');

  const upToDate = results.filter(r => r.status === 'up-to-date');
  const outdated = results.filter(r => r.status === 'outdated');
  const errors = results.filter(r => r.error);

  if (upToDate.length > 0) {
    console.log(`Up to date (${upToDate.length}):`);
    upToDate.forEach(r => console.log(`  - ${r.skillName}`));
    console.log();
  }

  if (outdated.length > 0) {
    console.log(`Outdated (${outdated.length}):`);
    outdated.forEach(r => {
      console.log(`  - ${r.skillName}`);
      console.log(`    Changed files: ${r.changedFiles.join(', ')}`);
      console.log(`    Compare: ${r.compareUrl}`);
    });
    console.log();
  }

  if (errors.length > 0) {
    console.log(`Errors (${errors.length}):`);
    errors.forEach(r => console.log(`  - ${r.skillName}: ${r.error}`));
    console.log();
  }

  // Exit with error code if any skills are outdated
  if (outdated.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
