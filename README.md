# PxeLab Website

Monorepo for the PxeLab marketing site (Astro) and documentation (VitePress).

## Project Structure

```
pxelab-website/
├── apps/
│   └── web/                  # Astro landing site
│       ├── src/
│       │   ├── components/   # Page section components
│       │   ├── layouts/      # Root Layout.astro
│       │   ├── pages/        # index.astro
│       │   ├── scripts/      # i18n.js, main.js
│       │   └── styles/       # global.css
│       └── public/fonts/     # Local font files
├── docs/                     # VitePress documentation
│   └── package.json
├── _archive/
│   └── demos/                # Alternative design explorations
├── package.json              # Root workspace scripts
├── pnpm-workspace.yaml
└── _routes.json              # Cloudflare Pages routing placeholder
```

## Getting Started

Install dependencies from the workspace root:

```bash
pnpm install
```

Start the Astro development server:

```bash
pnpm dev
```

Start the VitePress documentation server:

```bash
pnpm dev:docs
```

## Build

Build the whole workspace:

```bash
pnpm build
```

Build only the website or docs:

```bash
pnpm build:web
pnpm build:docs
```

Outputs:

- Website: `apps/web/dist/`
- Docs: `docs/.vitepress/dist/`

## Deployment Notes

Cloudflare Pages’ free tier does not support native multi-project rewrites under a single domain, so the monorepo requires one of the following approaches.

### Option A: Two separate Pages projects

1. Deploy `apps/web/dist` to the main Pages project at `pxelab.io`.
2. Deploy `docs/.vitepress/dist` to a second Pages project (e.g. `docs.pxelab.io`).
3. Point a DNS CNAME for `docs.pxelab.io` to the second project, or use a Cloudflare Worker rewrite to route `/docs/*` to it.

### Option B: Subpath build

Merge the VitePress build into a subpath of the Astro site (e.g. `/docs/`) during the build pipeline, then deploy the combined `apps/web/dist` to a single Pages project. This requires updating `astro.config.mjs` to copy or alias `docs/.vitepress/dist` into the web output.

### Routing

`_routes.json` is a placeholder that tells Cloudflare Pages to serve all routes while excluding static asset directories:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/fonts/*"]
}
```

Adjust it as needed once the final deployment strategy is chosen.
