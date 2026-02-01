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

// ============================================
// MAIN
// ============================================
async function main() {
  console.log('Fetching content from Notion...');

  try {
    const [quadrants, outcomes, examples] = await Promise.all([
      fetchQuadrants(),
      fetchOutcomes(),
      fetchExamples(),
    ]);

    // Validate we got all 4 quadrants
    const expectedQuadrants = ['people_design', 'people_research', 'product_design', 'product_research'];
    const missingQuadrants = expectedQuadrants.filter(q => !quadrants[q]);
    if (missingQuadrants.length > 0) {
      console.warn('WARNING: Missing quadrants: ' + missingQuadrants.join(', '));
    }

    // Assemble packs
    const packs = {};
    for (const key of Object.keys(quadrants)) {
      packs[key] = {
        ...quadrants[key],
        outcomes: outcomes[key] || [],
        examples: examples[key] || [],
      };

      if (!outcomes[key] || outcomes[key].length === 0) {
        console.warn('  Warning: ' + key + ' has no outcomes');
      }
      if (!examples[key] || examples[key].length === 0) {
        console.warn('  Warning: ' + key + ' has no examples');
      }
    }

    // Build output
    const content = {
      lastUpdated: new Date().toISOString(),
      note: 'Auto-generated from Notion. Do not edit directly.',
      packs,
    };

    // Write to file
    const outputPath = path.join(__dirname, '..', 'data', 'package-builder-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));

    console.log('Success! Saved to ' + outputPath);
    console.log('  ' + Object.keys(packs).length + ' packs');

  } catch (err) {
    console.error('Sync failed:', err.message);
    if (err.code) console.error('  Error code:', err.code);
    process.exit(1);
  }
}

main();