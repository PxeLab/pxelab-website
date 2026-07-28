/**
 * Combined build script for PxeLab website.
 *
 * Builds the Astro landing site and the VitePress docs, then merges the docs
 * output into the Astro dist directory under `/docs` so a single Cloudflare
 * Pages project can serve both the marketing site and the documentation.
 */
import { spawn } from 'node:child_process'
import { cp, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const webDist = path.join(root, 'apps/web/dist')
const docsDist = path.join(root, 'docs/.vitepress/dist')
const docsTarget = path.join(webDist, 'docs')
const routesFile = path.join(root, '_routes.json')

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...options.env },
      cwd: options.cwd || root,
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Command failed with exit code ${code}: ${cmd} ${args.join(' ')}`))
    })
  })
}

async function main() {
  // 1. Clean previous outputs
  await rm(webDist, { recursive: true, force: true })
  await rm(docsDist, { recursive: true, force: true })

  // 2. Build Astro website
  await run('pnpm', ['--filter', '@pxelab/web', 'build'])

  // 3. Build VitePress docs with /docs base path
  await run('pnpm', ['--filter', '@pxelab/docs', 'build'], {
    env: { VITEPRESS_BASE: '/docs' },
  })

  // 4. Merge docs into the web dist directory
  await cp(docsDist, docsTarget, { recursive: true, force: true })

  // 5. Copy Cloudflare Pages routing rules into the deploy root
  await cp(routesFile, path.join(webDist, '_routes.json'))

  console.log(`\n✅ Build complete: ${webDist}`)
  console.log(`   Website: ${webDist}`)
  console.log(`   Docs:    ${docsTarget}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
