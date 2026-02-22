# winded.vertigo Site — Project Conventions

## Creaseworks Project — Mount Instructions
- **CRITICAL**: The creaseworks app lives at `/Users/garrettjaeger/Projects/creaseworks` on Garrett's machine (NOT in this windedvertigo-site repo).
- At the START of every session that involves creaseworks work, use `request_cowork_directory` to mount that path immediately.
- The mount goes stale frequently (after git pulls, long pauses, etc.). If any file read/write fails with "No such file or directory", re-mount before retrying.
- The `.git` directory is NOT visible through the mount. All git operations (commit, push, pull) must be run by Garrett in his local terminal.
- Repo: `ghandoff/creaseworks` (private), main branch. Live at `creaseworks.windedvertigo.com`.

## winded.vertigo Infrastructure — Decision Log
- **Multiple Vercel projects**: Garrett's `/Users/garrettjaeger/Projects/` folder contains multiple Vercel-hosted apps (creaseworks, sqr-rct, and potentially more). Maria is also building apps.
- **Supabase evaluation (revisit when starting next new project)**: Creaseworks uses Neon Postgres + Auth.js + Resend. For the NEXT new w.v app, evaluate Supabase as an all-in-one alternative (Postgres + auth + file storage + real-time). Don't migrate creaseworks mid-flight — test on a fresh project first. If it works well, consider consolidating later.
- **Vercel consolidation (revisit with creaseworks + static site merge)**: Plan is to move windedvertigo.com static site to Vercel alongside the apps, using path-based routing (`/studio/creaseworks/`, etc.) and shared CSS. This enables all w.v projects to share the header/footer/brand system.
- **Notion as CMS**: All w.v editorial content is authored in Notion and synced to Postgres caches. API rate limit is 3 req/sec — monitor as more projects sync. Consider extracting a shared sync library when the second Notion-backed project launches.

## Git & CI Conventions
- **Always rebase before push in CI workflows.** Any GitHub Actions workflow that commits and pushes should include `git pull --rebase origin main` before `git push` to avoid push rejections when the remote has moved forward.
- **Thorough comments on every commit to scripts.** When committing changes to any script file, include a detailed comment block at or near the change site explaining what changed and why — not just a git commit message, but inline code comments within the script itself.
- The Sync Notion Content workflow (`.github/workflows/sync-notion.yml`) runs on push to main, manual dispatch, and daily at 6 AM UTC.

## Notion Integration
- Portfolio assets are fetched from the BD multi-database (parent ID: `5e27b792adbb4a958779900fb59dd631`) via the `notion.search()` API — NOT `databases.query()`, which doesn't work with multi-databases.
- The Notion REST API returns the `url` property under its actual name `url`, not `userDefined:url` (which is an MCP-only convention).
- Quadrant relations are hydrated via cached `hydrateQuadrantRel()` calls.

## Portfolio & Package Builder
- `portfolio-assets.json` is the single source of truth for both the portfolio page and the package builder examples.
- Assets with `showInPackageBuilder=true` but `showInPortfolio=false` are valid — they appear in the package builder "See it in action" tiles and deep-link into the portfolio modal via `ALL_ASSETS`, bypassing the portfolio grid filter.
- The portfolio page maintains two arrays: `ASSETS` (portfolio-visible, for grid display) and `ALL_ASSETS` (complete set, for deep links, related assets, and password checks).
