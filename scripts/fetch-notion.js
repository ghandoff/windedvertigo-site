/**
 * NOTION CONTENT FETCHER
 *
 * Fetches content from Notion databases and generates
 * a JSON file for the Package Builder.
 *
 * Features:
 * - Centralized config (see notion-config.js)
 * - Retry logic for transient failures
 * - Validation of required properties
 * - Detailed error reporting
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const config = require('./notion-config');

// Validate environment
if (!process.env.NOTION_API_KEY) {
  console.error('ERROR: NOTION_API_KEY environment variable is not set');
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ============================================
// RETRY WRAPPER
// ============================================
async function withRetry(fn, name) {
  const { maxAttempts, delayMs, backoffMultiplier } = config.retry;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
        console.warn('  Warning: ' + name + ' failed (attempt ' + attempt + '/' + maxAttempts + '), retrying in ' + delay + 'ms...');
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw new Error(name + ' failed after ' + maxAttempts + ' attempts: ' + lastError.message);
}

// ============================================
// PROPERTY EXTRACTORS
// ============================================
function getTextValue(prop) {
  if (!prop) return '';
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
  return '';
}

function getTitleValue(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('');
  return '';
}

function getSelectValue(prop) {
  if (!prop) return '';
  if (prop.type === 'select') return prop.select?.name || '';
  return '';
}

function getUrlValue(prop) {
  if (!prop) return '';
  if (prop.type === 'url') return prop.url || '';
  return '';
}

// Get URL with fallback options
function getUrlWithFallback(props, keys) {
  if (Array.isArray(keys)) {
    for (const key of keys) {
      const val = getUrlValue(props[key]);
      if (val) return val;
    }
    return '';
  }
  return getUrlValue(props[keys]);
}

function getMultiSelectValue(prop) {
  if (!prop) return [];
  if (prop.type === 'multi_select') return prop.multi_select.map(s => s.name);
  return [];
}

function getCheckboxValue(prop) {
  if (!prop) return false;
  if (prop.type === 'checkbox') return prop.checkbox;
  return false;
}

function getNumberValue(prop) {
  if (!prop) return null;
  if (prop.type === 'number') return prop.number;
  return null;
}

// Extract first file URL from a Files & media property
function getFilesValue(prop) {
  if (!prop) return '';
  if (prop.type === 'files' && prop.files.length > 0) {
    const file = prop.files[0];
    // Handle both Notion-hosted files and external URLs
    if (file.type === 'file') {
      return file.file.url;
    } else if (file.type === 'external') {
      return file.external.url;
    }
  }
  return '';
}

// Hybrid extractor: tries files first, then falls back to text
function getIconValue(prop) {
  if (!prop) return '';
  // If it's a files property, get the URL
  if (prop.type === 'files') {
    return getFilesValue(prop);
  }
  // If it's rich_text (emoji/text), get the text
  if (prop.type === 'rich_text') {
    return getTextValue(prop);
  }
  return '';
}

// ============================================
// VALIDATION
// ============================================
function validatePage(page, requiredProps, dbName) {
  const props = page.properties;
  const missing = requiredProps.filter(prop => {
    const val = props[prop];
    if (!val) return true;
    if (val.type === 'title') return getTitleValue(val) === '';
    if (val.type === 'select') return getSelectValue(val) === '';
    if (val.type === 'rich_text') return getTextValue(val) === '';
    return false;
  });

  if (missing.length > 0) {
    const pageTitle = getTitleValue(props['Name']) || getTitleValue(props['Title']) || page.id;
    console.warn('  Warning: ' + dbName + ': "' + pageTitle + '" missing required: ' + missing.join(', '));
    return false;
  }
  return true;
}

// ============================================
// FETCH FUNCTIONS  
// ============================================
async function fetchQuadrants() {
  const propMap = config.properties.quadrants;
  const required = config.required.quadrants;

  const response = await withRetry(
    () => notion.databases.query({ database_id: config.databases.quadrants }),
    'fetchQuadrants'
  );

  const result = {};
  let skipped = 0;

  for (const page of response.results) {
    if (!validatePage(page, required, 'Quadrants')) {
      skipped++;
      continue;
    }

    const props = page.properties;
    const key = getSelectValue(props[propMap.key]);

    if (key) {
      result[key] = {
        title: getTextValue(props[propMap.title]),
        promise: getTextValue(props[propMap.promise]),
        quadrantStory: getTextValue(props[propMap.quadrantStory]),
        story: getTextValue(props[propMap.story]),
        crossover: getTextValue(props[propMap.crossover]),
      };
    }
  }

  console.log('  OK Quadrants: ' + Object.keys(result).length + ' loaded, ' + skipped + ' skipped');
  return result;
}

async function fetchOutcomes() {
  const propMap = config.properties.outcomes;
  const required = config.required.outcomes;

  const response = await withRetry(
    () => notion.databases.query({
      database_id: config.databases.outcomes,
      sorts: [{ property: propMap.order, direction: 'ascending' }],
    }),
    'fetchOutcomes'
  );

  const byQuadrant = {};
  let total = 0;
  let skipped = 0;

  for (const page of response.results) {
    if (!validatePage(page, required, 'Outcomes')) {
      skipped++;
      continue;
    }

    const props = page.properties;
    const quadrant = getSelectValue(props[propMap.quadrant]);

    if (quadrant) {
      if (!byQuadrant[quadrant]) byQuadrant[quadrant] = [];
      byQuadrant[quadrant].push({
        title: getTitleValue(props[propMap.name]),
        detail: getTextValue(props[propMap.detail]),
      });
      total++;
    }
  }

  console.log('  OK Outcomes: ' + total + ' loaded across ' + Object.keys(byQuadrant).length + ' quadrants, ' + skipped + ' skipped');
  return byQuadrant;
}

async function fetchExamples() {
  const propMap = config.properties.examples;
  const required = config.required.examples;

  const response = await withRetry(
    () => notion.databases.query({
      database_id: config.databases.examples,
      sorts: [{ property: propMap.order, direction: 'ascending' }],
    }),
    'fetchExamples'
  );

  const byQuadrant = {};
  let total = 0;
  let skipped = 0;

  for (const page of response.results) {
    if (!validatePage(page, required, 'Examples')) {
      skipped++;
      continue;
    }

    const props = page.properties;
    const quadrant = getSelectValue(props[propMap.quadrant]);

    if (quadrant) {
      if (!byQuadrant[quadrant]) byQuadrant[quadrant] = [];
      byQuadrant[quadrant].push({
        title: getTitleValue(props[propMap.name]),
        type: getTextValue(props[propMap.type]),
        icon: getTextValue(props[propMap.icon]),
        url: getUrlWithFallback(props, propMap.url),
        detail: getTextValue(props[propMap.detail]),
      });
      total++;
    }
  }

  console.log('  OK Examples: ' + total + ' loaded across ' + Object.keys(byQuadrant).length + ' quadrants, ' + skipped + ' skipped');
  return byQuadrant;
}

async function fetchPortfolioAssets() {
  const propMap = config.properties.portfolioAssets;
  const required = config.required.portfolioAssets;

  const response = await withRetry(
    () => notion.databases.query({
      database_id: config.databases.portfolioAssets,
      sorts: [{ property: propMap.order, direction: 'ascending' }],
    }),
    'fetchPortfolioAssets'
  );

  const assets = [];
  let skipped = 0;

  for (const page of response.results) {
    if (!validatePage(page, required, 'Portfolio Assets')) {
      skipped++;
      continue;
    }

    const props = page.properties;
    assets.push({
      id: page.id,
      name: getTitleValue(props[propMap.name]),
      assetType: getSelectValue(props[propMap.assetType]),
      quadrants: getMultiSelectValue(props[propMap.quadrants]),
      url: getUrlWithFallback(props, propMap.url),
      thumbnailUrl: getUrlValue(props[propMap.thumbnailUrl]),
      description: getTextValue(props[propMap.description]),
      tags: getMultiSelectValue(props[propMap.tags]),
      featured: getCheckboxValue(props[propMap.featured]),
      showInPackageBuilder: getCheckboxValue(props[propMap.showInPackageBuilder]),
      showInPortfolio: getCheckboxValue(props[propMap.showInPortfolio]),
      passwordProtected: getCheckboxValue(props[propMap.passwordProtected]),
      password: getTextValue(props[propMap.password]),
      client: getTextValue(props[propMap.client]),
      order: getNumberValue(props[propMap.order]),
      icon: getIconValue(props[propMap.icon]),
    });
  }

  console.log('  OK Portfolio Assets: ' + assets.length + ' loaded, ' + skipped + ' skipped');
  return assets;
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('Fetching content from Notion...');

  try {
    const [quadrants, outcomes, portfolioAssets] = await Promise.all([
      fetchQuadrants(),
      fetchOutcomes(),
      fetchPortfolioAssets(),
    ]);

    // Validate we got all 4 quadrants
    const expectedQuadrants = ['people-design', 'people-research', 'product-design', 'product-research'];
    const missingQuadrants = expectedQuadrants.filter(q => !quadrants[q]);
    if (missingQuadrants.length > 0) {
      console.warn('WARNING: Missing quadrants: ' + missingQuadrants.join(', '));
    }

    // Generate examples from portfolio assets (filtered by showInPackageBuilder)
    // Use quadrant names directly - they should match the keys in the Quadrants database
    const examplesFromAssets = {};
    for (const asset of portfolioAssets) {
      if (!asset.showInPackageBuilder) continue;

      for (const quadrant of asset.quadrants) {
        // Use quadrant name as-is (e.g., 'product-design') to match Quadrant database keys
        if (!examplesFromAssets[quadrant]) examplesFromAssets[quadrant] = [];
        examplesFromAssets[quadrant].push({
          id: asset.id,
          title: asset.name,
          type: asset.assetType,
          icon: asset.icon,
          url: asset.url,
          detail: asset.description,
        });
      }
    }

    const packageBuilderExamples = Object.keys(examplesFromAssets).reduce((acc, key) => acc + examplesFromAssets[key].length, 0);
    console.log('  OK Examples (from Portfolio Assets): ' + packageBuilderExamples + ' items with showInPackageBuilder=true');

    // Assemble packs
    const packs = {};
    for (const key of Object.keys(quadrants)) {
      packs[key] = {
        ...quadrants[key],
        outcomes: outcomes[key] || [],
        examples: examplesFromAssets[key] || [],
      };

      if (!outcomes[key] || outcomes[key].length === 0) {
        console.warn('  Warning: ' + key + ' has no outcomes');
      }
      if (!examplesFromAssets[key] || examplesFromAssets[key].length === 0) {
        console.warn('  Warning: ' + key + ' has no examples (check showInPackageBuilder in Portfolio Assets)');
      }
    }

    // Build output
    const content = {
      lastUpdated: new Date().toISOString(),
      note: 'Auto-generated from Notion. Do not edit directly.',
      packs,
    };

    // Write Package Builder content
    const outputPath = path.join(__dirname, '..', 'data', 'package-builder-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));

    // Write Portfolio Assets
    const portfolioContent = {
      lastUpdated: new Date().toISOString(),
      note: 'Auto-generated from Notion. Do not edit directly.',
      assets: portfolioAssets,
    };
    const portfolioPath = path.join(__dirname, '..', 'data', 'portfolio-assets.json');
    fs.writeFileSync(portfolioPath, JSON.stringify(portfolioContent, null, 2));

    console.log('Success!');
    console.log('  Package Builder: ' + Object.keys(packs).length + ' packs → ' + outputPath);
    console.log('  Portfolio: ' + portfolioAssets.length + ' assets → ' + portfolioPath);

  } catch (err) {
    console.error('Sync failed:', err.message);
    if (err.code) console.error('  Error code:', err.code);
    process.exit(1);
  }
}

main();