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
├── scripts/
│   └── build.mjs             # Combined build (web + docs subpath)
├── package.json              # Root workspace scripts
├── pnpm-workspace.yaml
├── _routes.json              # Cloudflare Pages routing rules
└── .github/workflows/deploy.yml  # Automated Cloudflare Pages deployment
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

Build the whole workspace (Astro website + VitePress docs merged into `/docs`):

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
- Docs: `apps/web/dist/docs/` (merged into the website output)

## Deployment

The site is designed to be deployed as a single Cloudflare Pages project. The marketing site lives at the root (`/`) and the VitePress documentation lives under `/docs/`.

### Cloudflare Pages setup

1. Fork or connect this repository in the Cloudflare Pages dashboard.
2. Create a new Pages project named `pxelab-website`.
3. Use the following build settings if you connect the repository directly:
   - **Build command:** `pnpm build`
   - **Build output directory:** `apps/web/dist`
4. Add the required environment variables in the Pages project settings:
   - `NODE_VERSION`: `20`
   - `PNPM_VERSION`: `9`

### GitHub Actions automated deployment

The repository includes `.github/workflows/deploy.yml`. To enable it:

1. Go to the Cloudflare dashboard → **Manage account** → **API Tokens**.
2. Create a token with the **Cloudflare Pages:Edit** permission for your account.
3. In the GitHub repository, go to **Settings → Secrets and variables → Actions**.
4. Add two repository secrets:
   - `CLOUDFLARE_API_TOKEN`: the token created above
   - `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID

On every push to `main`, the workflow builds the site and deploys it to Cloudflare Pages.

### Domain setup

You can use a single domain for both the website and docs:

- Root domain (`pxelab.io`) → serves the Astro marketing site
- `pxelab.io/docs/` → serves the VitePress documentation

If you prefer separate subdomains later, deploy the docs output to a second Pages project and add a CNAME for `docs.pxelab.io`.

### Routing

`_routes.json` tells Cloudflare Pages to serve all routes while bypassing static asset directories:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/assets/*", "/fonts/*", "/docs/assets/*"]
}
```
