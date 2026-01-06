const esbuild = require('esbuild');
const fs = require('fs');

const buildFile = async (entry, outfile) => {
  if (!fs.existsSync(entry)) return;
  
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    external: ['@aws-sdk/*']
  });
};

(async () => {
  await buildFile('src/editor.ts', 'dist/editor.js');
  await buildFile('src/backend.ts', 'dist/backend.js');
  await buildFile('src/renderer.ts', 'dist/renderer.js');
  
  fs.copyFileSync('manifest.json', 'dist/manifest.json');
  console.log('Build complete');
})();
