const fs = require('fs');
const path = require('path');

const target = process.argv[2];
if (!target || !['installer', 'recover'].includes(target.toLowerCase())) {
  console.log('Usage: node scripts/switch-app.js <installer|recover>');
  process.exit(1);
}

const configPath = path.join(__dirname, '..', 'app_target.json');
const normalized = target.toLowerCase();
const config = {
  target: normalized,
  comment: "Set to 'installer' for App A (Recover Installer) or 'recover' for App B (Recover Wallet)",
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
console.log(`Successfully switched active app target to: ${normalized === 'installer' ? 'App A (Recover Installer)' : 'App B (Recover Wallet)'}`);
