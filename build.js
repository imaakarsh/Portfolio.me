const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'public', 'dist');

/**
 * Recursively copy directory with .js files
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  items.forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (item.endsWith('.js')) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${destPath}`);
    }
  });
}

// Clean and build
console.log('Building JavaScript files...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

copyDir(srcDir, distDir);
console.log('✓ Build complete! Files ready in public/dist/');
