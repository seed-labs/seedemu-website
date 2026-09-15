# SEED Internet Emulator website

An English-language Jekyll website for the SEED Internet Emulator, a platform for
Internet research, education, and experimentation.

## Run locally

Install Ruby 3.3 and Bundler, then run these commands from the repository root:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Open [http://localhost:4000](http://localhost:4000). On Windows, RubyInstaller with
Devkit provides Ruby and the tools needed to install native gem dependencies.

To create the production site:

```sh
JEKYLL_ENV=production bundle exec jekyll build --trace
```

In PowerShell, set the environment variable before building:

```powershell
$env:JEKYLL_ENV = "production"
bundle exec jekyll build --trace
```

Generated files are written to `_site/` and are ignored by Git.

## Edit the site

- `_config.yml` holds the site title, description, public URL, and Jekyll settings.
- `_layouts/default.html` provides the shared document shell, and
  `_layouts/page.html` composes inner pages with their common header.
- `_includes/head.html`, `header.html`, `footer.html`, and `scripts.html` provide
  shared page infrastructure.
- `_includes/components/` contains reusable cards, icons, section headings,
  code blocks, tags, video players, and network illustrations.
- `_includes/sections/` contains the shared hero, feature, workflow, scenario,
  case study, demo, quick-start, and call-to-action sections. Keep repeated markup
  in includes; render it with Liquid's `{% include %}` tag and pass values as
  parameters.
- `_data/navigation.yml` defines navigation links, and `_data/site_content.yml`
  stores shared structured content consumed by pages and includes.
- `_data/themes.yml` defines five palettes: Terracotta, Forest, Ocean, Graphite,
  and Original. `css/themes.css` generates their
  shared color variables, and `_includes/components/theme-picker.html` provides
  the header selector. The choice is stored locally in the visitor's browser;
  `_includes/theme-init.html` restores it before styles load to avoid a color flash.
- Pages at the repository root provide English content and front matter.
- The footer language button offers Chinese copy review while English remains
  the default. `_data/zh.json` stores translations, and `_includes/language.html`
  loads the shared switcher. The choice lasts for the current browser tab;
  code samples and protocol names retain their original text.
- `css/`, `images/`, and `video/` contain local presentation and media assets.

Add YAML front matter to every page that should use a Jekyll layout. Use
`relative_url` for local links and assets so the site can also run under a project
base path. Restart the development server after changing `_config.yml`.

## Deploy to GitHub Pages

In the repository's **Settings → Pages**, select **GitHub Actions** as the build
and deployment source. The workflow in `.github/workflows/static.yml` installs
the locked Ruby dependencies, builds Jekyll, and deploys only `_site/` after a push
to `master`. Pull requests build the site without deploying it. The workflow can
also be started manually from the Actions tab.

The published site is configured for
[https://gandlfst.github.io](https://gandlfst.github.io). Update `url` and `baseurl`
in `_config.yml` before deploying to a different location.
