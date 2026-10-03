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

// Copy vendored runtime assets (lottie-web player, inlined into transcripts
// that contain Lottie stickers so those files stay self-contained offline)
const srcVendorDir = path.join(__dirname, 'src', 'template', 'vendor');
if (fs.existsSync(srcVendorDir)) {
  const distVendorDir = path.join(distTemplateDir, 'vendor');
  fs.mkdirSync(distVendorDir, { recursive: true });
  for (const name of fs.readdirSync(srcVendorDir)) {
    fs.copyFileSync(path.join(srcVendorDir, name), path.join(distVendorDir, name));
  }
  console.log('Successfully copied vendor assets to dist/template/vendor');
}
