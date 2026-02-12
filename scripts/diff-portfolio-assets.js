#!/usr/bin/env node
/**
 * PORTFOLIO ASSETS DIFF
 *
 * Compares portfolio-assets.json (legacy) with portfolio-assets.bd.json (BD)
 * to verify the shadow export matches before cutting over.
 *
 * Usage:
 *   node scripts/diff-portfolio-assets.js          # print report
 *   node scripts/diff-portfolio-assets.js --strict  # exit 1 if any mismatches
 */

const fs = require('fs');
const path = require('path');

const STRICT = process.argv.includes('--strict');

// ── Load both files ──
const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    console.error('ERROR: ' + filepath + ' not found. Run fetch-notion.js first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
}

const legacy = loadJSON('portfolio-assets.json');
const bd = loadJSON('portfolio-assets.bd.json');

// ── Index by slug ──
function indexBySlug(assets, label) {
  const map = {};
  const dupes = [];
  for (const asset of assets) {
    const slug = asset.slug;
    if (!slug) {
      console.warn('  Warning: ' + label + ' asset "' + asset.name + '" has no slug');
      continue;
    }
    if (map[slug]) {
      dupes.push(slug);
    }
    map[slug] = asset;
  }
  if (dupes.length > 0) {
    console.warn('  Warning: ' + label + ' has duplicate slugs: ' + dupes.join(', '));
  }
  return map;
}

const legacyMap = indexBySlug(legacy.assets || [], 'legacy');
const bdMap = indexBySlug(bd.assets || [], 'bd');

const allSlugs = [...new Set([...Object.keys(legacyMap), ...Object.keys(bdMap)])].sort();

// ── Compare ──
// Fields to compare (skip id since it will differ between databases)
const COMPARE_FIELDS = [
  'name', 'assetType', 'quadrants', 'quadrantKey',
  'url', 'thumbnailUrl', 'description', 'tags',
  'featured', 'showInPackageBuilder', 'showInPortfolio',
  'passwordProtected', 'password', 'client', 'order', 'icon',
];

let onlyLegacy = [];
let onlyBD = [];
let matched = [];
let mismatched = [];

for (const slug of allSlugs) {
  const l = legacyMap[slug];
  const b = bdMap[slug];

  if (l && !b) {
    onlyLegacy.push(slug);
    continue;
  }
  if (!l && b) {
    onlyBD.push(slug);
    continue;
  }

  // Both exist — compare fields
  const diffs = [];
  for (const field of COMPARE_FIELDS) {
    const lv = JSON.stringify(l[field]);
    const bv = JSON.stringify(b[field]);
    if (lv !== bv) {
      diffs.push({ field, legacy: l[field], bd: b[field] });
    }
  }

  if (diffs.length === 0) {
    matched.push(slug);
  } else {
    mismatched.push({ slug, diffs });
  }
}

// ── Report ──
console.log('');
console.log('=== Portfolio Assets Diff ===');
console.log('  Legacy: ' + (legacy.assets || []).length + ' assets (' + legacy.lastUpdated + ')');
console.log('  BD:     ' + (bd.assets || []).length + ' assets (' + bd.lastUpdated + ')');
console.log('  Slugs:  ' + allSlugs.length + ' unique');
console.log('');

if (matched.length > 0) {
  console.log('Matched (' + matched.length + '):');
  for (const s of matched) console.log('  ' + s);
  console.log('');
}

if (onlyLegacy.length > 0) {
  console.log('Only in legacy (' + onlyLegacy.length + '):');
  for (const s of onlyLegacy) console.log('  - ' + s);
  console.log('');
}

if (onlyBD.length > 0) {
  console.log('Only in BD (' + onlyBD.length + '):');
  for (const s of onlyBD) console.log('  + ' + s);
  console.log('');
}

if (mismatched.length > 0) {
  console.log('Mismatched (' + mismatched.length + '):');
  for (const { slug, diffs } of mismatched) {
    console.log('  ' + slug + ':');
    for (const { field, legacy: lv, bd: bv } of diffs) {
      console.log('    ' + field + ':');
      console.log('      legacy: ' + JSON.stringify(lv));
      console.log('      bd:     ' + JSON.stringify(bv));
    }
  }
  console.log('');
}

// ── Summary ──
const total = allSlugs.length;
const ok = matched.length;
const issues = onlyLegacy.length + onlyBD.length + mismatched.length;
console.log('Summary: ' + ok + '/' + total + ' match, ' + issues + ' issue(s)');

if (STRICT && issues > 0) {
  console.error('STRICT MODE: Exiting with code 1 due to mismatches.');
  process.exit(1);
}
