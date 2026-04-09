import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.resolve(__dirname, '../content/blog');
const OUTPUT_DIR = path.resolve(__dirname, '../content/generated');

const GITHUB_REPO = 'weorbitant/orbitant-os';

interface BlogPostFrontmatter {
  title: string;
  description?: string;
  date: string;
  author?: string;
  tags?: string;
}

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  content: string;
  plugin?: string;
  version?: string;
  isRelease: boolean;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
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

function parseBlogPost(filePath: string): BlogPost | null {
  const parsed = parseMarkdownFrontmatter<BlogPostFrontmatter>(filePath);
  if (!parsed) {
    return null;
  }

  const { data, content } = parsed;
  const filename = path.basename(filePath, path.extname(filePath));

  // Extract slug from filename (e.g., "2026-03-03-welcome" -> "welcome")
  const slugMatch = filename.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
  const slug = slugMatch ? slugMatch[1] : filename;

  const tagsString = data.tags || '';
  const tags = tagsString
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || '',
    author: data.author || 'Orbitant Team',
    tags,
    content: content.trim(),
    isRelease: false,
  };
}

function extractPluginFromTag(tag: string): string | undefined {
  // "orbitant-marketing-v1.2.0" -> "marketing"
  // "orbitant-chief-of-staff-v1.3.0" -> "chief-of-staff"
  const match = tag.match(/^orbitant-(.+)-v\d+\.\d+\.\d+$/);
  return match ? match[1] : undefined;
}

function extractVersionFromTag(tag: string): string | undefined {
  // "orbitant-marketing-v1.2.0" -> "1.2.0"
  const match = tag.match(/v(\d+\.\d+\.\d+)$/);
  return match ? match[1] : undefined;
}

function extractFirstParagraph(body: string | null): string {
  if (!body) return '';

  // Remove markdown headers and find first paragraph
  const lines = body.split('\n');
  const paragraphLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip headers, empty lines at the start, and horizontal rules
    if (trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('**Full Changelog**')) {
      if (paragraphLines.length > 0) break;
      continue;
    }
    if (trimmed === '' && paragraphLines.length > 0) break;
    if (trimmed) {
      paragraphLines.push(trimmed);
    }
  }

  const paragraph = paragraphLines.join(' ');
  // Truncate to ~200 chars
  return paragraph.length > 200 ? paragraph.slice(0, 197) + '...' : paragraph;
}

async function fetchGitHubReleases(): Promise<BlogPost[]> {
  console.log('Fetching GitHub releases...');

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'orbitant-os-parser',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('  No releases found (404)');
        return [];
      }
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const releases: GitHubRelease[] = await response.json();

    // Filter out drafts
    const publishedReleases = releases.filter((r) => !r.draft);
    console.log(`  Found ${publishedReleases.length} published releases`);

    return publishedReleases.map((release) => {
      const plugin = extractPluginFromTag(release.tag_name);
      const version = extractVersionFromTag(release.tag_name);

      // Build tags array
      const tags = ['release'];
      if (plugin) tags.push(plugin);
      if (release.prerelease) tags.push('prerelease');

      // Convert "Full Changelog" plain-text tag ranges into proper markdown links
      const content = (release.body || '').replace(
        /\*\*Full Changelog\*\*:\s*([\w.-]+\.\.\.[\w.-]+)/g,
        `**Full Changelog**: [$1](https://github.com/${GITHUB_REPO}/compare/$1)`
      );

      return {
        slug: `release-${release.tag_name}`,
        title: release.name || release.tag_name,
        description: extractFirstParagraph(release.body),
        date: release.published_at.split('T')[0],
        author: 'Orbitant Team',
        tags,
        content,
        plugin,
        version,
        isRelease: true,
      };
    });
  } catch (error) {
    console.warn(`Warning: Could not fetch GitHub releases: ${error}`);
    return [];
  }
}

function parseLocalBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No local blog directory found, skipping local posts');
    return posts;
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) =>
    f.endsWith('.md') || f.endsWith('.mdx')
  );

  for (const file of files) {
    const post = parseBlogPost(path.join(BLOG_DIR, file));
    if (post) {
      posts.push(post);
    }
  }

  console.log(`Parsed ${posts.length} local blog posts`);
  return posts;
}

async function main() {
  console.log('Parsing blog posts...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get posts from both sources
  const localPosts = parseLocalBlogPosts();
  const releasePosts = await fetchGitHubReleases();

  // Merge and sort by date (newest first)
  const allPosts = [...localPosts, ...releasePosts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Write output
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'blog.json'),
    JSON.stringify(allPosts, null, 2)
  );

  console.log(`\nGenerated ${allPosts.length} blog posts (${localPosts.length} local, ${releasePosts.length} releases)`);
  console.log(`Output written to: ${path.join(OUTPUT_DIR, 'blog.json')}`);
}

main();
