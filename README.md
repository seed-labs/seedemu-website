# SEED Emulators website

An English Jekyll website using the Teal palette, with visitor theme controls hidden.
The homepage explicitly renders three projects: Internet, Satellite, and Blockchain.

## Run locally

Install Ruby 3.3 and Bundler, then run from the repository root:

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1 --port 4173
```

Open http://127.0.0.1:4173/. Restart Jekyll after changing `_config.yml`.
Build without a server using `bundle exec jekyll build`. `_site/` contains generated
output; edit the source files instead.

## Project structure

```text
index.html                         Homepage
pages/
  internet-emulator/                Project entry, examples/, case-studies/, presentation/, how-to-use/, screenshots/
  satellite/                       Same project-specific child pages
  blockchain/                      Same project-specific child pages
  about-us/                        Team page
  examples/
    index.html                     Legacy address: choose a project catalog
    _examples/                     URL stubs for individual examples
    _example_readmes/               Imported upstream README pages
  papers/                          Shared publications page
  case-studies/                    Case Studies overview and legacy redirect
  visualization/                   Imported visualization manuals
_data/
  internet/                        Internet project content
  satellite/                       Satellite project content
  blockchain/                      Blockchain project content
  shared/
    examples.yml                   Categories and upstream repository links
    themes.yml                     Palette definitions
  about-us/
    team.yml                       Team members and GitHub usernames
assets/images/
  shared/                          Shared logo and mark
  internet/                        Internet project images
  satellite/                       Satellite project images
  blockchain/                      Blockchain project images
_layouts/                          Page-type layouts; no layout nesting
_includes/single-use/              Page-specific includes grouped by page name
_includes/shared/                  Shared components
css/                               Styles
js/                                Navigation and example filtering
scripts/sync-example-readmes.rb     Example README importer
scripts/sync-visualization-manuals.py Visualization manual importer (Python standard library)
```

Pages declare explicit permalinks, so their public URLs do not include `/pages/`.
`collections_dir: pages/examples` locates both example collections. Their URLs
remain `/examples/<slug>/` and `/examples/<slug>/readme/`.

Short fixed copy belongs directly in its page or include. Header, footer, hero,
and sidebar each own their text. Shared Papers and project-specific Case Studies
keep their small lists in page front matter. Project introductions also live in their project pages.
Presentation lists and screenshot galleries live in their own page front matter;
these child pages look up the project page only for the parent title and link.

Each project data folder contains:

- `card.yml`: homepage card copy and image, independent from project details.
- `examples.yml`: example metadata, descriptions, source paths, and overview text.

Public images live under `assets/images/<project>/`; shared branding lives under
`assets/images/shared/`. Keep `_data` for YAML content only.

## Page composition

Layouts are split by page responsibility and are not nested. `home` renders the
homepage, `project` serves the three project entries, `examples` serves the catalog,
and `example` serves individual examples. Legacy `/readme/` URLs use
`example-readme`. Simple authored pages—including project presentation and
screenshot pages—continue to use `default` and select their content directly in
their own `index.html`.

Project pages keep copy in page front matter, select a project data folder, and
render `project-page.html`.

The homepage uses `_includes/single-use/home/` for its hero, projects, and
sidebar. The three cards are authored explicitly in projects.html, without iterating over projects.
Other page-specific includes are grouped under `about-us`.
The three projects reuse `shared/example-catalog.html` and `shared/example-row.html`,
but each catalog reads only its own project's examples.yml. Empty categories are hidden.
Papers uses `resource-list-page.html`; project Case Studies use `resource-page.html`
with independent items in each project's case-studies/index.html.
Shared readers, resource rows, and icons live under `_includes/shared/`.

Project resources appear in this order: Presentations, How to use, Examples,
Papers, Case Studies. The labels use Font Awesome icons, loaded only on project pages.
Examples link to each project's `/examples/` child page, and Case Studies to its
`/case-studies/` child page. Only Papers links to the shared `/papers/` page.
The `/examples/` and `/case-studies/` entry pages are project selectors, not
combined content lists. The former case-study address redirects to `/case-studies/`;
no current navigation links use that former address. Existing screenshot pages
remain accessible by their URLs.

## Example content

The project catalogs currently contain 21 Internet examples, 9 Blockchain examples,
and no Satellite examples. Edit each example in its owning project's `examples.yml`.
Short `description` text appears in that project's catalog; `overview` appears on
the detail page. A matching Markdown stub
in `pages/examples/_examples/` supplies layout and routing settings.

To add an example:

1. Add a record with `title`, `description`, `code`, `category_id`, `source_path`,
   `slug`, `url`, and `overview` to the owning project's `examples.yml`.
2. Add `pages/examples/_examples/<slug>.md` using an existing stub as a template.
3. Run the README importer and build the site.

Each detail page keeps its authored Overview at the top and embeds the imported
README below it, with a View on GitHub link to the upstream source.
`shared/example-context.html` resolves the owning project from its examples.yml.
The header, breadcrumb, and return link point to that project, including on legacy
README pages. Detail URLs stay `/examples/<slug>/` so existing links do not break. The existing
`A15_toplogy_generator` spelling
matches the upstream path and is intentional.

## Import example READMEs

```sh
ruby scripts/sync-example-readmes.rb
bundle exec jekyll build
```

The script reads the three project example lists and downloads only each
`source_path/README.md` from `seed-labs/seed-emulator` on `master`. It writes the
unchanged Markdown to `pages/examples/_example_readmes/<slug>.md`, preceded by:

```yaml
---
layout: example-readme
---
```

The script does not clone the repository, convert Markdown, or download images.
On Windows it defaults to `http://127.0.0.1:7890` unless `https_proxy` or
`HTTPS_PROXY` is already set. Set `https_proxy` to an empty string for a direct
connection. Linux and macOS retain their existing proxy settings.

Collection defaults disable Liquid evaluation in imported README text. The layout
looks up the matching example by filename. `shared/example-readme-body.html` renders
the README body for both the example page and legacy reader. It maps the D01 image reference to
`/assets/images/blockchain/POS-1.png` and A11's two relative sub-guide links to GitHub.
Additional guide links can be mapped for display with an example's readme_links list
(from and to); this does not modify imported Markdown. Other relative references
remain as supplied upstream; use View on GitHub when needed.

Commit imported READMEs along with their example records and stubs. Jekyll builds
do not fetch from GitHub. Re-running the importer overwrites imported text; edit
authored introductions in project data instead. Remove corresponding generated
files manually when removing an example; the importer does not delete files.

## Import visualization manuals

Choose one of the following alternatives; both write to `pages/visualization/`:

- `sync-visualization-manuals.py`: current Python version, automatically scans Markdown files and converts relative image and chapter links; no extra dependencies.
- `sync-visualization-manuals-simple.rb`: standalone copy-only version, for use after upstream
  image and chapter links are ready for the website. It adds page metadata but leaves the
  Markdown body unchanged. Absolute website links also lead to the live site during local preview.

The Python importer discovers new chapters automatically. Only the copy-only Ruby
alternative still has a fixed manual list that needs updating when adding a chapter.
Use the current version while upstream still uses relative links:

```sh
python scripts/sync-visualization-manuals.py
bundle exec jekyll build
```

Once upstream links have been updated, use `ruby scripts/sync-visualization-manuals-simple.rb`
instead of the first command above. Do not run both alternatives for the same import.

The Python importer scans `docs/user-manual/` and its subdirectories in
`seed-labs/seed-visualization` on `main`, using the GitHub tree API to find all `.md` files.
No manual file list or repository clone is needed. It uses the system's proxy settings
or `HTTPS_PROXY` environment variable, without a hardcoded local proxy.
It generates Markdown pages in `pages/visualization/`, with public URLs under
`/visualization/`. Visualization is an independent main-navigation entry before
About us, not a child of Internet Emulator or How to use. The two importers run
independently; run both commands when updating both sets of documentation.

For the current upstream manuals, the importer converts relative `.md` links to local
page URLs and relative `.png` images to `raw.githubusercontent.com` URLs; no images are
downloaded or copied. It uses the simple inline `[text](path)` format present in these
manuals. Links with other suffixes, HTML links, and reference-style links are left as
written. The `manual` layout applies the site's
base path to internal links and shares existing README styles, header, and footer.

Imported manuals have Liquid evaluation disabled and retain a View on GitHub link.
Each manual is saved immediately after download; if a later download fails, earlier updates remain.
Generated Markdown is committed with the website; regular Jekyll builds do not need
GitHub access. Re-run the importer for upstream updates; it overwrites generated
manual pages, not authored pages, and does not delete removed upstream documents.

## Common edits

| Change | File |
| --- | --- |
| Homepage heading and introduction | `_includes/single-use/home/hero.html` |
| Homepage sidebar | `_includes/single-use/home/sidebar.html` |
| Homepage News and release announcements | `_includes/single-use/home/sidebar.html` (`portal-sidebar-news`) |
| Homepage cards | `_data/<project>/card.yml` |
| Public images | `assets/images/<project>/` |
| Project descriptions and overviews | `pages/<project>/index.html` |
| Presentations | `pages/<project>/presentation/index.html` (`items`) |
| Screenshot descriptions and images | `pages/<project>/screenshots/index.html` (`description`, `items`) |
| Example descriptions and overviews | `_data/<project>/examples.yml` |
| Shared papers | `pages/papers/index.html` |
| Case Studies overview | `pages/case-studies/index.html` |
| Project case studies | `pages/<project>/case-studies/index.html` (`items`) |
| Project example catalog | `pages/<project>/examples/index.html` and `_data/<project>/examples.yml` |
| Visualization user manuals | `scripts/sync-visualization-manuals.py` (generated Markdown; do not edit by hand) |
| Team member lists and GitHub avatars | `_data/about-us/team.yml` |
| Footer | `_includes/shared/footer.html` |
| Navigation | `_includes/shared/header.html` |
| Colors | `_data/shared/themes.yml`, `portal_theme` in `_config.yml` |
| Page layout and typography | `css/main.css`, `css/examples.css` |

Team entries use `name`, optional `github`, and optional `affiliation`. GitHub
avatars use the username, with initials as a fallback. The footer and homepage
sidebar maintain separate copy because their available space differs.

The sidebar reserves a News section below Useful resources. When a release is ready,
replace its empty-state paragraph with the dated announcement and optional link.
News is authored directly in the sidebar; no separate data file or layout is needed.

`show_theme_picker: false` hides visitor theme controls. Local links use
`relative_url` to support a base path. Small WebP project illustrations are used
on the homepage; full-size originals remain available under `assets/images/`.


## Build and publish

```sh
bundle exec jekyll build
```

To preview deployment under a base path:

```sh
bundle exec jekyll build --baseurl /preview --destination ../seedemu-preview
```

Use a temporary directory outside the repository for alternate builds.

The production site is https://www.seedemulator.org, published from
`seed-labs/seedemu-website`. Both `_config.yml` and `CNAME` use the official
domain; `baseurl` is empty. Local preview commands stay the same.

The workflow in `.github/workflows/static.yml` behaves as follows:

- Pull requests targeting `main` build without publishing.
- Pushes or merges to the official repository's `main` publish after a successful build.
- Manual runs build wherever the workflow is available; only official
  `main` may deploy.
- Pushes to `test` or `development` do not publish. Updates to an open PR
  rerun its checks.
- Forks do not deploy the production site through this workflow.

Before merging, a repository administrator must confirm:

1. **Settings → Pages → Build and deployment → Source** is **GitHub Actions**.
   This uses the Jekyll version in the workflow instead of the old branch build.
2. **Custom domain** remains `www.seedemulator.org`, with DNS pointing to
   `seed-labs.github.io`. For custom Actions deployments, `CNAME` does not
   replace the domain setting in GitHub.
3. If the `github-pages` environment restricts deployment branches, it allows
   `main`.

After merging, confirm that both build and deploy succeed in Actions, then
check the production site.

### Personal preview

`Gandlfst/seed-emulator-www` publishes `development` to
https://gandlfst.github.io/seed-emulator-www/ using `.github/workflows/preview.yml`.
The preview build adds `_config.preview.yml` and omits `CNAME` from its output.
This workflow runs only in the personal repository; the production workflow and
domain configuration remain unchanged. Its Pages source must be **GitHub Actions**.
