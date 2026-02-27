const fs = require('fs');
const path = require('path');

const PYQ_ROOT = path.join(__dirname, '..', 'pyq');

// Get all folders in pyq directory
const folders = fs.readdirSync(PYQ_ROOT, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

let fixed = 0;
let alreadyHad = 0;

folders.forEach(folder => {
  const indexPath = path.join(PYQ_ROOT, folder, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    return;
  }
  
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Check if theme.js is already present
  if (html.includes('theme.js')) {
    alreadyHad++;
    return;
  }
  
  // Add theme.js before closing body tag
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx === -1) {
    console.log(`Warning: No </body> tag found in ${folder}/index.html`);
    return;
  }
  
  const before = html.slice(0, bodyCloseIdx);
  const after = html.slice(bodyCloseIdx);
  const updatedHtml = before + '    <script src="../assets/js/theme.js" defer></script>\n' + after;
  
  fs.writeFileSync(indexPath, updatedHtml, 'utf8');
  fixed++;
  console.log(`✓ Fixed: ${folder}/index.html`);
});

console.log(`\n=== Summary ===`);
console.log(`Fixed: ${fixed} files`);
console.log(`Already had theme.js: ${alreadyHad} files`);
console.log(`Total folders processed: ${folders.length}`);
