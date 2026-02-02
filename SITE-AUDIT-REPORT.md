# Site Audit Report: windedvertigo.com Migration Readiness

**Date:** February 2, 2026
**Prepared for:** DNS migration from GitHub Pages to windedvertigo.com

---

## Executive Summary

The site is functional but requires several fixes before migrating to the production domain. There are **3 critical issues**, **4 high-priority issues**, and **5 recommended improvements**.

---

## Critical Issues (Must Fix Before Migration)

### 1. Hardcoded GitHub Pages URLs in Portfolio Data
**File:** `data/portfolio-assets.json`
**Issue:** All `thumbnailUrl` fields reference `https://ghandoff.github.io/windedvertigo-site/...`
**Impact:** Portfolio thumbnails will break after domain change
**Fix:** Change to relative URLs: `./images/thumbnails/...` or `/images/thumbnails/...`

### 2. Character Encoding Corruption in do/index.html
**File:** `do/index.html`
**Issue:** Special characters corrupted (likely from GitHub web editor):
- `Â©` should be `©`
- `Ã` should be `×`
- `â` should be `—` or `→`

**Locations:**
- Line 651: Copyright symbol
- Lines 727, 736, 745, 754: Quadrant story text (× and —)
- Line 921: Email body template
- Line 969: Arrow symbol
- Lines 1068, 1071: Console log symbols

**Fix:** Re-encode file as UTF-8 or manually fix characters

### 3. Missing CNAME File
**Issue:** No CNAME file for custom domain configuration
**Fix:** Create `CNAME` file with content: `windedvertigo.com`

---

## High Priority Issues

### 4. Missing SEO Essentials
**Issues:**
- No favicon (browser tab icon)
- No Open Graph meta tags (social sharing)
- No Twitter Card meta tags
- No canonical URLs
- No robots.txt
- No sitemap.xml

**Impact:** Poor social sharing previews, SEO issues, no search engine guidance

### 5. Deprecated/Backup Files to Remove
**Files to delete:**
- `do-client-side/` (entire folder - old version)
- `do-build-time/` (entire folder - old version)
- `do/index-backup.html` (backup file)

**Impact:** Clutter, potential confusion, wasted bandwidth

### 6. Duplicate Member Images
**Files with duplicates:**
- `images/members/garrett-jaeger.jpg` & `garrett-jaeger-phd.jpg`
- `images/members/maria-altamirano.jpg` & `maria-altamirano-gonzalez.jpg`
- `images/members/jamie-galpin.jpg` & `jamie-galpin-phd.jpg`

**Fix:** Determine which to keep, update references, delete unused

### 7. Missing 404 Page
**Issue:** No custom 404.html for graceful error handling
**Fix:** Create branded 404 page with navigation back to home

---

## Recommended Improvements

### 8. Add Structured Data (Schema.org)
Add JSON-LD for organization and services to improve search results

### 9. CSS Version Parameter Inconsistency
Some pages use `main.css?v=11`, others use `?v=12`
Standardize version parameter across all pages

### 10. Project Page Images Missing
`do/index-backup.html` references images that may not exist:
- `images/impactful-five.png`
- `images/play-for-all.jpg`

### 11. Portfolio URLs Point to Non-Existent Pages
In `portfolio-assets.json`:
- `https://windedvertigo.com/projects/learning-game` (doesn't exist yet)
- `https://windedvertigo.com/projects/impact-dashboard` (doesn't exist yet)

### 12. Node Modules Committed
The `node_modules/` folder appears to be tracked. Add to `.gitignore` if not already.

---

## What's Working Well

- ✅ All internal links use relative paths (migration-friendly)
- ✅ Meta descriptions on all pages
- ✅ Skip links for accessibility
- ✅ ARIA labels on interactive elements
- ✅ Alt text on all images
- ✅ Mobile navigation toggle implemented
- ✅ External social links correct
- ✅ Google Calendar booking link working
- ✅ Notion sync functioning properly

---

## Migration Checklist

Before pointing DNS to this site:

- [ ] Fix hardcoded URLs in portfolio-assets.json
- [ ] Fix character encoding in do/index.html
- [ ] Create CNAME file
- [ ] Add favicon
- [ ] Add Open Graph meta tags
- [ ] Create robots.txt
- [ ] Create sitemap.xml
- [ ] Create 404.html
- [ ] Remove deprecated folders (do-client-side, do-build-time)
- [ ] Remove backup files (do/index-backup.html)
- [ ] Test all pages after domain switch

---

## Post-Migration Tasks

- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics (if desired)
- [ ] Test all Notion sync functionality
- [ ] Verify SSL certificate working
- [ ] Set up redirect from www to non-www (or vice versa)
