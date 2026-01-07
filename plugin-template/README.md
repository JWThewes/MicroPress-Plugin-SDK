# MicroPress Plugin Template

Template for creating MicroPress CMS plugins.

## Quick Start

1. **Clone this template**
   ```bash
   git clone https://github.com/JWThewes/MicroPress-Plugin-SDK my-plugin
   cd my-plugin/plugin-template
   ```

2. **Update manifest.json**
   - Change `id`, `name`, `description`, `author`
   - Set capabilities (`editor`, `backend`, `renderer`)
   - Define endpoints if using backend
   - Set permissions

3. **Create source files**
   ```bash
   # Copy examples and rename
   cp src/backend.ts.example src/backend.ts
   cp src/renderer.ts.example src/renderer.ts
   cp src/editor.ts.example src/editor.ts
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Build**
   ```bash
   npm run build        # Compile to dist/
   npm run build:zip    # Create plugin.zip for release
   ```

6. **Release**
   ```bash
   git tag v1.0.0
   git push --tags
   # GitHub Action will create plugin.zip release automatically
   ```

## Project Structure

```
my-plugin/
├── manifest.json          # Plugin metadata (required)
├── package.json           # Build dependencies
├── tsconfig.json          # TypeScript config
├── scripts/
│   └── bundle.js          # Build script (esbuild)
├── src/
│   ├── backend.ts         # Server-side API handlers
│   ├── renderer.ts        # HTML transformation hooks
│   └── editor.ts          # TipTap editor extension
└── dist/                  # Build output (gitignored)
    ├── manifest.json
    ├── backend.js
    ├── renderer.js
    └── editor.js
```

## Plugin Types

### Backend Plugin (`src/backend.ts`)
- Handles API endpoints defined in manifest
- Receives `(event, sdk: PluginSDK)` parameters
- Returns API Gateway response format

### Renderer Plugin (`src/renderer.ts`)
- Transforms content during publish
- `beforeConversion(json, sdk)` - Modify TipTap JSON
- `afterConversion(html, sdk)` - Modify HTML output
- `injectAssets()` - Add CSS/JS to pages

### Editor Plugin (`src/editor.ts`)
- TipTap extension for admin editor
- Export array of Node/Mark/Extension
- Runs in browser

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to dist/ |
| `npm run build:zip` | Build and create plugin.zip |
| `npm run clean` | Remove dist/ and plugin.zip |
| `npm run typecheck` | Check TypeScript types |

## Publishing

Plugins must be **pre-compiled** before publishing. The MicroPress install Lambda expects:

```
plugin.zip/
├── manifest.json    (required)
├── backend.js       (if capabilities.backend = true)
├── renderer.js      (if capabilities.renderer = true)
└── editor.js        (if capabilities.editor = true)
```

The GitHub Action workflow automatically:
1. Builds on tag push (v*)
2. Creates plugin.zip from dist/
3. Attaches to GitHub release

## SDK Usage

```typescript
import type { PluginSDK } from '@micropress/plugin-sdk';

// Store data (prefixed with plugin ID automatically)
await sdk.putData('key', { foo: 'bar' });

// Retrieve data
const data = await sdk.getData('key');

// List keys
const keys = await sdk.listData('prefix-');

// Read pages/news (read-only)
const page = await sdk.getPage('page-id');

// Logging
sdk.log('info', 'Message', { meta: 'data' });
```

## License

MIT
