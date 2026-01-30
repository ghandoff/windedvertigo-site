const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');
const https = require('https');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const MEMBERS_DATABASE_ID = 'cc118d3a-960e-4cb6-b78e-f2709f3c64b7';

const MEMBER_ORDER = [
  'garrett jaeger',
  'maría altamirano',
  'jamie galpin',
  'lamis sabra',
  'aaron fruit',
  'payton jaeger'
];

async function fetchMembers() {
  const response = await notion.databases.query({
    database_id: MEMBERS_DATABASE_ID,
    filter: { property: 'active', checkbox: { equals: true } }
  });

  const members = response.results.map(page => {
    const props = page.properties;
    return {
      name: props['first & last name']?.title?.[0]?.plain_text || '',
      role: props['company role']?.rich_text?.[0]?.plain_text || '',
      bio: props['bio']?.rich_text?.[0]?.plain_text || '',
      pronouns: props['pronouns']?.select?.name || '',
      skillSets: props['skill sets']?.multi_select?.map(s => s.name) || []
    };
  });

  members.sort((a, b) => {
    const aIndex = MEMBER_ORDER.findIndex(n => a.name.toLowerCase().includes(n));
    const bIndex = MEMBER_ORDER.findIndex(n => b.name.toLowerCase().includes(n));
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return members;
}

function generateMemberHTML(member) {
  const tagsHTML = member.skillSets.length > 0
    ? `<div class="tags">\n            ${member.skillSets.map(tag => `<span class="tag">${tag}</span>`).join('\n            ')}\n          </div>`
    : '';

  const bioParagraphs = member.bio
    .split(/\n\n|\r\n\r\n/)
    .filter(p => p.trim())
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n            ');

  return `
        <article class="team-member">
          <h2>${member.name.toLowerCase()}</h2>
          <p class="role">${member.role.toLowerCase()}</p>
          <div class="bio">
            ${bioParagraphs || '<p></p>'}
          </div>
          ${tagsHTML}
        </article>`;
}

async function updateWePage(members) {
  const wePath = path.join(__dirname, '..', 'we', 'index.html');
  let html = fs.readFileSync(wePath, 'utf8');

  const membersHTML = members.map(m => generateMemberHTML(m)).join('\n');
  const teamGridRegex = /(<div class="team-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/main>)/;

  if (html.match(teamGridRegex)) {
    html = html.replace(teamGridRegex, `$1\n${membersHTML}\n\n      $3`);
    fs.writeFileSync(wePath, html);
    console.log(`Updated we page with ${members.length} members`);
  } else {
    console.error('Could not find team-grid section');
  }
}

async function main() {
  console.log('Fetching members from Notion...');
  const members = await fetchMembers();
  console.log(`Found ${members.length} active members`);
  await updateWePage(members);
}

main().catch(console.error);
