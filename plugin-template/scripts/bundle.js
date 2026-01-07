const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = 'dist';

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const buildBackend = async () => {
  const entry = 'src/backend.ts';
  if (!fs.existsSync(entry)) return false;

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: path.join(distDir, 'backend.js'),
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    external: ['@aws-sdk/*', '@micropress/plugin-sdk']
  });
  console.log('✓ Built backend.js');
  return true;
};

const buildRenderer = async () => {
  const entry = 'src/renderer.ts';
  if (!fs.existsSync(entry)) return false;

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: path.join(distDir, 'renderer.js'),
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    external: ['@aws-sdk/*', '@micropress/plugin-sdk']
  });
  console.log('✓ Built renderer.js');
  return true;
};

const buildEditor = async () => {
  const entry = 'src/editor.ts';
  if (!fs.existsSync(entry)) return false;

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: path.join(distDir, 'editor.js'),
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
    external: ['@tiptap/*']
  });
  console.log('✓ Built editor.js');
  return true;
};

(async () => {
  console.log('Building plugin...\n');

  const results = await Promise.all([
    buildBackend(),
    buildRenderer(),
    buildEditor()
  ]);

  // Copy manifest.json to dist
  if (fs.existsSync('manifest.json')) {
    fs.copyFileSync('manifest.json', path.join(distDir, 'manifest.json'));
    console.log('✓ Copied manifest.json');
  } else {
    console.error('✗ manifest.json not found!');
    process.exit(1);
  }

  const builtCount = results.filter(Boolean).length;
  console.log(`\n✓ Build complete! (${builtCount} file(s) compiled)`);
  console.log(`  Output: ${distDir}/`);
  console.log('\nTo create release zip: npm run build:zip');
})();
