#!/usr/bin/env node

/**
 * Generates Orbitant blog thumbnails using Google's Imagen API
 * and composites the Orbitant watermark automatically.
 *
 * Usage:
 *   node scripts/generate-image.mjs --prompt "..." --output path/to/image.png [OPTIONS]
 *
 * Options:
 *   --prompt TEXT        Image generation prompt (required)
 *   --output FILE        Output file path, .png (required)
 *   --negative TEXT      Negative prompt (optional)
 *   --aspect RATIO       1:1, 3:4, 4:3, 9:16, 16:9 (default: 16:9)
 *   --model MODEL        Model ID (default: imagen-4.0-generate-001)
 *   --count N            Number of images, 1-4 (default: 1)
 *   --watermark TONE     Watermark variant: white, black, none (default: auto-detect)
 *   --help               Show this help
 *
 * Environment:
 *   GOOGLE_API_KEY       Required. Get one at https://aistudio.google.com/apikey
 *
 * Exit codes:
 *   0  Success
 *   1  Missing/invalid arguments
 *   2  Missing GOOGLE_API_KEY
 *   3  API or processing error
 */

import { writeFile, readFile, mkdir, access } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env file from the scripts directory if it exists
const envPath = join(__dirname, ".env");
try {
  await access(envPath);
  const envContent = await readFile(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // No .env file — rely on environment variables
}
const ASSETS_DIR = join(__dirname, "..", "assets");

const HELP = `Usage: node scripts/generate-image.mjs --prompt "..." --output path/to/image.png [OPTIONS]

Options:
  --prompt TEXT        Image generation prompt (required)
  --output FILE        Output file path, .png (required)
  --negative TEXT      Negative prompt (optional)
  --aspect RATIO       1:1, 3:4, 4:3, 9:16, 16:9 (default: 16:9)
  --model MODEL        Model ID (default: imagen-4.0-generate-001)
  --count N            Number of images, 1-4 (default: 1)
  --watermark TONE     white, black, or none (default: auto-detect from image brightness)
  --help               Show this help

Environment:
  GOOGLE_API_KEY       Required. Get one at https://aistudio.google.com/apikey`;

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      prompt: { type: "string" },
      output: { type: "string" },
      negative: { type: "string", default: "" },
      aspect: { type: "string", default: "16:9" },
      model: { type: "string", default: "imagen-4.0-generate-001" },
      count: { type: "string", default: "3" },
      watermark: { type: "string", default: "auto" },
      help: { type: "boolean", default: false },
    },
  });
  return values;
}

/**
 * Detects whether the bottom strip of an image is dark or light
 * to choose the right watermark color.
 */
async function detectWatermarkTone(sharp, imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  const { width, height } = metadata;

  // Sample the bottom 10% of the image
  const stripHeight = Math.round(height * 0.1);
  const stats = await sharp(imageBuffer)
    .extract({ left: 0, top: height - stripHeight, width, height: stripHeight })
    .stats();

  // Average brightness across RGB channels
  const avgBrightness =
    (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;

  return avgBrightness < 128 ? "white" : "black";
}

/**
 * Composites the Orbitant watermark onto the generated image.
 */
async function addWatermark(sharp, imageBuffer, tone) {
  const watermarkPath = join(ASSETS_DIR, `watermark-${tone}.svg`);
  const watermarkSvg = await readFile(watermarkPath);

  const metadata = await sharp(imageBuffer).metadata();
  const { width, height } = metadata;

  // Scale watermark to ~20% of image width
  const wmWidth = Math.round(width * 0.2);
  const wmHeight = Math.round(wmWidth * (155 / 805)); // preserve SVG aspect ratio

  const resizedWatermark = await sharp(watermarkSvg)
    .resize(wmWidth, wmHeight)
    .png()
    .toBuffer();

  // Position: centered horizontally, 5% from bottom
  const left = Math.round((width - wmWidth) / 2);
  const top = Math.round(height - height * 0.05 - wmHeight);

  const result = await sharp(imageBuffer)
    .composite([{ input: resizedWatermark, left, top }])
    .png()
    .toBuffer();

  return result;
}

async function main() {
  const args = parseCliArgs();

  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!args.prompt) {
    console.error("Error: --prompt is required.\n");
    console.error(HELP);
    process.exit(1);
  }
  if (!args.output) {
    console.error("Error: --output is required.\n");
    console.error(HELP);
    process.exit(1);
  }
  if (extname(args.output) !== ".png") {
    console.error(
      `Error: --output must end in .png. Received: "${args.output}"`
    );
    process.exit(1);
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error(
      "Error: GOOGLE_API_KEY environment variable is not set.\n" +
        "Get one at: https://aistudio.google.com/apikey"
    );
    process.exit(2);
  }

  const validAspects = ["1:1", "3:4", "4:3", "9:16", "16:9"];
  if (!validAspects.includes(args.aspect)) {
    console.error(
      `Error: --aspect must be one of: ${validAspects.join(", ")}.\n` +
        `       Received: "${args.aspect}"`
    );
    process.exit(1);
  }

  const validWatermarks = ["auto", "white", "black", "none"];
  if (!validWatermarks.includes(args.watermark)) {
    console.error(
      `Error: --watermark must be one of: ${validWatermarks.join(", ")}.\n` +
        `       Received: "${args.watermark}"`
    );
    process.exit(1);
  }

  const count = parseInt(args.count, 10);
  if (isNaN(count) || count < 1 || count > 4) {
    console.error("Error: --count must be between 1 and 4.");
    process.exit(1);
  }

  // Load dependencies
  let GoogleGenAI, sharp;
  try {
    const genaiMod = await import("@google/genai");
    GoogleGenAI = genaiMod.GoogleGenAI;
  } catch {
    console.error(
      "Error: @google/genai package not found.\n" +
        "Install it: npm install @google/genai"
    );
    process.exit(1);
  }
  try {
    const sharpMod = await import("sharp");
    sharp = sharpMod.default;
  } catch {
    console.error(
      "Error: sharp package not found.\n" + "Install it: npm install sharp"
    );
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  console.error(`Generating ${count} image(s) with ${args.model}...`);
  console.error(`Aspect ratio: ${args.aspect}`);
  console.error(`Prompt: ${args.prompt.substring(0, 120)}...`);

  let response;
  try {
    const config = {
      numberOfImages: count,
      aspectRatio: args.aspect,
    };
    if (args.negative) {
      config.negativePrompt = args.negative;
    }
    response = await ai.models.generateImages({
      model: args.model,
      prompt: args.prompt,
      config,
    });
  } catch (err) {
    console.error(`API error: ${err.message}`);
    process.exit(3);
  }

  if (!response.generatedImages || response.generatedImages.length === 0) {
    console.error(
      "Error: API returned no images. The prompt may have been blocked by safety filters."
    );
    process.exit(3);
  }

  await mkdir(dirname(args.output), { recursive: true });

  const results = [];
  for (let i = 0; i < response.generatedImages.length; i++) {
    const imgBytes = response.generatedImages[i].image.imageBytes;
    const originalBuffer = Buffer.from(imgBytes, "base64");

    // Determine output paths
    const basePath =
      count === 1
        ? args.output
        : args.output.replace(".png", `-${i + 1}.png`);
    const brandedPath = basePath.replace(".png", "_branded.png");

    // Save original (no watermark)
    await writeFile(basePath, originalBuffer);
    const originalSizeKB = Math.round(originalBuffer.length / 1024);
    console.error(`Saved original: ${basePath} (${originalSizeKB} KB)`);
    results.push({ path: basePath, sizeKB: originalSizeKB, type: "original" });

    // Save branded (with watermark)
    if (args.watermark !== "none") {
      try {
        const tone =
          args.watermark === "auto"
            ? await detectWatermarkTone(sharp, originalBuffer)
            : args.watermark;
        const brandedBuffer = await addWatermark(sharp, originalBuffer, tone);
        await writeFile(brandedPath, brandedBuffer);
        const brandedSizeKB = Math.round(brandedBuffer.length / 1024);
        console.error(`Saved branded: ${brandedPath} (${brandedSizeKB} KB) — watermark: ${tone} (${args.watermark === "auto" ? "auto-detected" : "manual"})`);
        results.push({ path: brandedPath, sizeKB: brandedSizeKB, type: "branded" });
      } catch (err) {
        console.error(`Warning: watermark failed (${err.message}), branded version not saved`);
      }
    }
  }

  // Save prompt metadata alongside images for reproducibility
  const promptFile = args.output.replace(".png", ".prompt.json");
  const promptData = {
    prompt: args.prompt,
    negative: args.negative || null,
    model: args.model,
    aspect: args.aspect,
    count,
    watermark: args.watermark,
    generatedAt: new Date().toISOString(),
    images: results,
  };
  await writeFile(promptFile, JSON.stringify(promptData, null, 2));
  console.error(`Saved prompt: ${promptFile}`);

  // Structured output to stdout for the agent
  console.log(JSON.stringify({ success: true, promptFile, images: results }, null, 2));
}

main();
