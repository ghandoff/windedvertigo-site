# winded.vertigo Site — Project Conventions

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
