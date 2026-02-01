/**
 * NOTION SYNC CONFIGURATION
 *
 * Centralized configuration for Notion integration.
 * Edit this file to update database IDs or property mappings.
 */

module.exports = {
  // Notion Database IDs (from Notion page URLs)
  databases: {
    quadrants: '1c171d25825b418caf94805dc1568352',
    outcomes: 'b8ff41d2d4ef41559e01c2d952a3a1da',
    examples: 'de0bc6fe83d54d71a91b31d8f1eb73bd',
  },

  // Property name mappings (Notion column name → internal key)
  // If Notion column names change, update them here only
  properties: {
    quadrants: {
      key: 'Quadrant Key',
      title: 'Title',
      promise: 'Promise',
      quadrantStory: 'Quadrant Story',
      story: 'How We Work',
      crossover: 'Crossover Note',
    },
    outcomes: {
      quadrant: 'Quadrant',
      name: 'Name',
      detail: 'Detail',
      order: 'Order',
    },
    examples: {
      quadrant: 'Quadrant',
      name: 'Name',
      type: 'Type',
      icon: 'Icon',
      url: ['URL', 'userDefined:URL'], // Fallback options
      detail: 'Detail',
      order: 'Order',
    },
  },

  // Required properties for validation (sync fails if missing)
  required: {
    quadrants: ['Quadrant Key', 'Title'],
    outcomes: ['Quadrant', 'Name'],
    examples: ['Quadrant', 'Name'],
  },

  // Retry configuration for API calls
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },
};
