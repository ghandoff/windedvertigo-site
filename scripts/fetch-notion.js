/**
 * NOTION CONTENT FETCHER
 * 
 * This script fetches content from your Notion databases
 * and generates a JSON file for the Package Builder.
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// YOUR NOTION DATABASE IDs (from Notion page URLs)
const DATABASE_IDS = {
  quadrants: '1c171d25825b418caf94805dc1568352',
  outcomes: 'b8ff41d2d4ef41559e01c2d952a3a1da',
  examples: 'de0bc6fe83d54d71a91b31d8f1eb73bd',
};

// FETCH FUNCTIONS
async function fetchQuadrants() {
  const response = await notion.databases.query({
    database_id: DATABASE_IDS.quadrants,
  });

  return response.results.reduce((acc, page) => {
    const props = page.properties;
    const key = getSelectValue(props['Quadrant Key']);
    
    if (key) {
      acc[key] = {
        title: getTextValue(props['Title']),
        promise: getTextValue(props['Promise']),
        quadrantStory: getTextValue(props['Quadrant Story']),
        story: getTextValue(props['How We Work']),
        crossover: getTextValue(props['Crossover Note']),
      };
    }
    return acc;
  }, {});
}

async function fetchOutcomes() {
  const response = await notion.databases.query({
    database_id: DATABASE_IDS.outcomes,
    sorts: [{ property: 'Order', direction: 'ascending' }],
  });

  const byQuadrant = {};
  response.results.forEach(page => {
    const props = page.properties;
    const quadrant = getSelectValue(props['Quadrant']);
    if (quadrant) {
      if (!byQuadrant[quadrant]) byQuadrant[quadrant] = [];
      byQuadrant[quadrant].push({
        title: getTitleValue(props['Name']),
        detail: getTextValue(props['Detail']),
      });
    }
  });
  return byQuadrant;
}

async function fetchExamples() {
  const response = await notion.databases.query({
    database_id: DATABASE_IDS.examples,
    sorts: [{ property: 'Order', direction: 'ascending' }],
  });

  const byQuadrant = {};
  response.results.forEach(page => {
    const props = page.properties;
    const quadrant = getSelectValue(props['Quadrant']);
    if (quadrant) {
      if (!byQuadrant[quadrant]) byQuadrant[quadrant] = [];
      byQuadrant[quadrant].push({
        title: getTitleValue(props['Name']),
        type: getTextValue(props['Type']),
        icon: getTextValue(props['Icon']),
        url: getUrlValue(props['URL']) || getUrlValue(props['userDefined:URL']),
        detail: getTextValue(props['Detail']),
      });
    }
  });
  return byQuadrant;
}

// HELPERS
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

// MAIN
async function main() {
  console.log('Fetching from Notion...');
  try {
    const [quadrants, outcomes, examples] = await Promise.all([
      fetchQuadrants(), fetchOutcomes(), fetchExamples()
    ]);

    const packs = {};
    for (const key of Object.keys(quadrants)) {
      packs[key] = { ...quadrants[key], outcomes: outcomes[key] || [], examples: examples[key] || [] };
    }

    const content = { lastUpdated: new Date().toISOString(), packs };
    const outputPath = path.join(__dirname, '..', 'data', 'package-builder-content.json');
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));
    console.log('Done! Saved to', outputPath);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
