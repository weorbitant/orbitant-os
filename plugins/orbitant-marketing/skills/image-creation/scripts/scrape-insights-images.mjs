#!/usr/bin/env node

/**
 * Downloads curated blog thumbnail images from orbitant.com for visual
 * pattern analysis. Safe to re-run — skips existing files.
 *
 * Usage:
 *   node scrape-insights-images.mjs [OPTIONS]
 *
 * Options:
 *   --force    Re-download all images even if they already exist
 *   --help     Show this help message
 */

import { writeFile, mkdir, access } from "node:fs/promises";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "assets", "reference");
const BATCH_SIZE = 5;

// Curated list of AI-generated conceptual metaphor images that represent
// the target visual style. To add a new reference image, append its full URL.
const IMAGE_URLS = [
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-02-desarrollo-software-personalizado.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-04-legacy-system-migration.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-09-DevOps-enterprise.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-11-Fearless-Software-Development.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-16-Inteligencia-artificial-para-empresas.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-18-gestion-de-errores-en-service-bus.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-23-transformacion-digital-negocio.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-25-value-of-software-business-impact.jpg",
  "https://orbitant.com/wp-content/uploads/2025/09/2025-09-30-Strategic-UX-design.jpg",
  "https://orbitant.com/wp-content/uploads/2025/10/2025-10-07-1-Arquitectura-desacoplada-1.jpg",
  "https://orbitant.com/wp-content/uploads/2025/10/2025-10-09-ataques-npm-IA-1.jpg",
  "https://orbitant.com/wp-content/uploads/2025/10/2025-10-14-CI-CD-1.jpg",
  "https://orbitant.com/wp-content/uploads/2025/10/2025-10-16-Running-Legacy-Systems-During-Migration.jpg",
  "https://orbitant.com/wp-content/uploads/2025/11/2025-10-28-errores-comunes-transformacion-digital.jpg",
  "https://orbitant.com/wp-content/uploads/2025/10/2025-10-30-refactorizacion.jpg",
  "https://orbitant.com/wp-content/uploads/2025/11/2025-11-13-5-Tips-for-Successful-Legacy-Migrations.jpg",
  "https://orbitant.com/wp-content/uploads/2025/11/2025-11-18-lanzar-producto-digital-mid-market.jpg",
  "https://orbitant.com/wp-content/uploads/2025/11/2025-11-27-The-Knowns-and-Unknowns-framework.jpg",
  "https://orbitant.com/wp-content/uploads/2025/12/2025-12-04-Vulnerabilidad-critica-React-Server-Components-1.jpg",
  "https://orbitant.com/wp-content/uploads/2025/12/2025-12-25-plug-play-business.jpg",
  "https://orbitant.com/wp-content/uploads/2026/01/2026-01-06-clean-architecture.jpg",
  "https://orbitant.com/wp-content/uploads/2026/01/2026-01-08-cambiar-un-microservicio.jpg",
  "https://orbitant.com/wp-content/uploads/2026/01/2026-01-22-lodash-CVE-2025-13465.jpg",
  "https://orbitant.com/wp-content/uploads/2026/01/2026-01-29-memory-leak-en-nodejs-debugging-fpolo.jpg",
  "https://orbitant.com/wp-content/uploads/2026/02/2026-02-05-writing-tickets-with-IA.jpg",
  "https://orbitant.com/wp-content/uploads/2026/03/2026-02-26-Building-your-best-knowledge-base-1.jpg",
];

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadImage(url, outputDir, force) {
  const filename = basename(new URL(url).pathname);
  const filepath = join(outputDir, filename);

  if (!force && (await fileExists(filepath))) {
    return "skipped";
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  FAIL [${res.status}] ${filename}`);
      return "failed";
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(filepath, buffer);
    console.log(
      `  OK   ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`
    );
    return "downloaded";
  } catch (err) {
    console.error(`  FAIL ${filename}: ${err.message}`);
    return "failed";
  }
}

function printHelp() {
  console.log(`Usage: node scrape-insights-images.mjs [OPTIONS]

Downloads curated blog thumbnail images from orbitant.com into
assets/reference/ for visual pattern analysis. Safe to re-run.

Options:
  --force, -f    Re-download all images even if they already exist
  --help,  -h    Show this help message

Examples:
  node scrape-insights-images.mjs          # Download only missing images
  node scrape-insights-images.mjs --force  # Re-download everything`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.some((a) => a === "--help" || a === "-h")) {
    printHelp();
    process.exit(0);
  }

  const force = args.some((a) => a === "--force" || a === "-f");

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(
    `Downloading ${IMAGE_URLS.length} reference images${force ? " (force mode)" : ""} to ${OUTPUT_DIR}\n`
  );

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < IMAGE_URLS.length; i += BATCH_SIZE) {
    const batch = IMAGE_URLS.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((url) => downloadImage(url, OUTPUT_DIR, force))
    );
    for (const r of results) {
      if (r === "downloaded") downloaded++;
      else if (r === "skipped") skipped++;
      else failed++;
    }
  }

  console.log(
    `\nDone: ${downloaded} downloaded, ${skipped} skipped (already exist), ${failed} failed`
  );

  if (failed > 0) process.exit(1);
}

main();
