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
    portfolioAssets: '8c0ad5be572c480fb403906c7af1b580',
    vertigoVault: '223e4ee74ba4805f8c92cda6e2b8ba00',
  },

  // Property name mappings (Notion column name → internal key)
  // If Notion column names change, update them here only
  properties: {
    quadrants: {
      key: 'Quadrant Key',
      title: 'Title',
      promise: 'Promise',
      quadrantStory: 'Quadrant Story',
      story: 'how we work',
      crossover: 'crossover note',
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
    portfolioAssets: {
      name: 'Name',
      assetType: 'Asset Type',
      quadrants: 'Quadrants',
      url: ['URL', 'userDefined:URL'],
      thumbnailUrl: 'Thumbnail URL',
      description: 'Description',
      tags: 'Tags',
      featured: 'Featured',
      showInPackageBuilder: 'Show in Package Builder',
      showInPortfolio: 'Show in Portfolio',
      passwordProtected: 'Password Protected',
      password: 'Password',
      client: 'Client',
      order: 'Order',
      icon: 'Icon',
    },
    vertigoVault: {
      name: 'name',
      headline: 'headline',
      duration: 'duration',
      format: 'format',
      type: 'type',
      skillsDeveloped: 'skills developed',
      filesMedia: 'files & media',
    },
  },

  // Required properties for validation (sync fails if missing)
  required: {
    quadrants: ['Quadrant Key', 'Title'],
    outcomes: ['Quadrant', 'Name'],
    examples: ['Quadrant', 'Name'],
    portfolioAssets: ['Name', 'Asset Type'],
    vertigoVault: ['name'],
  },

  // Retry configuration for API calls
  retry: {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
  },
};
