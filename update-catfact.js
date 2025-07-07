const fs = require('fs');
const https = require('https');
const { Resolver } = require('dns');

const README_PATH = 'README.md';
const API_URL = 'https://catfact.ninja/fact';

function fetchCatFact(callback) {
  const resolver = new Resolver();
  resolver.setServers(['1.1.1.1', '8.8.8.8']); // Use Cloudflare & Google DNS

  https.get(API_URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        callback(json.fact);
      } catch (err) {
        console.error("❌ Failed to parse response:", err);
      }
    });
  }).on('error', (err) => {
    console.error("❌ HTTPS request error:", err);
  });
}

function updateReadme(fact) {
  const readme = fs.readFileSync(README_PATH, 'utf8');

  const catFactRegex = /<!--START_SECTION:catfact-->[\s\S]*?<!--END_SECTION:catfact-->/;
  const newSection = `<!--START_SECTION:catfact-->\n🐾 ${fact}\n<!--END_SECTION:catfact-->`;

  if (readme.match(catFactRegex)?.[0] === newSection) {
    console.log("ℹ️ Fact is the same — skipping update.");
    return;
  }

  const updated = readme.replace(catFactRegex, newSection);
  fs.writeFileSync(README_PATH, updated, 'utf8');
  console.log("✅ Updated cat fact in README!");
}

fetchCatFact(updateReadme);
