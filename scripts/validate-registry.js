const fs = require('fs');
const https = require('https');

const registry = JSON.parse(fs.readFileSync('registry.json', 'utf8'));

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 302);
    }).on('error', () => resolve(false));
  });
}

(async () => {
  let hasErrors = false;
  
  for (const plugin of registry.plugins) {
    const exists = await checkUrl(`${plugin.releaseUrl}/releases/download/v${plugin.version}/plugin.zip`);
    if (!exists) {
      console.error(`❌ ${plugin.id}: Release URL not found`);
      hasErrors = true;
    } else {
      console.log(`✅ ${plugin.id}`);
    }
  }
  
  if (hasErrors) process.exit(1);
  console.log('\nRegistry validation passed');
})();
