import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://weorbitant.github.io',
  base: '/orbitant-os',
  integrations: [
    starlight({
      title: 'orbitant-os',
      description: "Orbitant's Claude Code plugin marketplace",
      logo: {
        src: './public/favicon.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/weorbitant/orbitant-os',
      },
      editLink: {
        baseUrl: 'https://github.com/weorbitant/orbitant-os/edit/main/website/',
      },
      // Force dark theme only
      head: [
        {
          tag: 'script',
          content: `localStorage.setItem('starlight-theme', 'dark');`,
        },
      ],
      components: {
        // Disable theme selector
        ThemeSelect: './src/components/EmptyThemeSelect.astro',
        // Custom header with nav links
        Search: './src/components/Search.astro',
      },
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Overview', slug: 'getting-started/quick-start' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Concepts', slug: 'getting-started/concepts' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Contributing', slug: 'guides/contributing' },
            { label: 'Creating Skills', slug: 'guides/creating-skills' },
            { label: 'GitHub Actions', slug: 'guides/github-actions' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Versioning', slug: 'reference/versioning' },
          ],
        },
        { label: 'FAQ', slug: 'faq' },
        {
          label: 'Browse',
          items: [
            { label: 'All Plugins', link: '/plugins/' },
            { label: 'Blog', link: '/blog/' },
          ],
        },
      ],
    }),
  ],
});
