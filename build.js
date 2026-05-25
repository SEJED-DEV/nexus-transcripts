const fs = require('fs');
const path = require('path');

// Ensure dist/template directory exists
const distTemplateDir = path.join(__dirname, 'dist', 'template');
if (!fs.existsSync(distTemplateDir)) {
  fs.mkdirSync(distTemplateDir, { recursive: true });
}

// Copy ui.html
const srcHtml = path.join(__dirname, 'src', 'template', 'ui.html');
const distHtml = path.join(distTemplateDir, 'ui.html');

fs.copyFileSync(srcHtml, distHtml);
console.log('Successfully copied ui.html to dist/template/ui.html');
