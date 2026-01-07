# Plugin Development Guide

## Quick Start

1. Copy plugin-template: `cp -r plugin-template my-plugin`
2. Update `manifest.json` with your plugin details
3. Copy example files: `cp src/*.example src/` and rename
4. Implement your plugin in `src/`
5. Build: `npm run build`
6. Create release: `npm run build:zip`
7. Tag and push: `git tag v1.0.0 && git push --tags`
8. Register in `registry.json`

## Important: Pre-compiled Plugins

**Plugins must be pre-compiled before publishing.** The MicroPress install Lambda does NOT compile TypeScript - it expects ready-to-run JavaScript files.

Your release zip must contain:
```
plugin.zip/
├── manifest.json    (required)
├── backend.js       (if capabilities.backend = true)
├── renderer.js      (if capabilities.renderer = true)
└── editor.js        (if capabilities.editor = true)
```

## Plugin Types

### Editor Plugin
- File: `src/editor.ts`
- Output: `dist/editor.js` (ESM, browser target)
- Export: Array of TipTap Node/Mark/Extension
- Loaded dynamically in admin interface

### Backend Plugin
- File: `src/backend.ts`
- Output: `dist/backend.js` (CJS, Node.js target)
- Export: Named functions matching manifest endpoints
- Receives: `(event, sdk: PluginSDK)`

### Renderer Plugin
- File: `src/renderer.ts`
- Output: `dist/renderer.js` (CJS, Node.js target)
- Exports: `beforeConversion`, `afterConversion`, `injectAssets`
- Runs during static site generation

## SDK Usage

```typescript
import type { PluginSDK } from '@micropress/plugin-sdk';

// Store data (key is automatically prefixed with plugin ID)
await sdk.putData('key', { foo: 'bar' });

// Retrieve data
const data = await sdk.getData('key');

// List keys
const keys = await sdk.listData('prefix-');

// Read pages/news (read-only)
const page = await sdk.getPage('page-id');
const news = await sdk.getNews('news-id');

// Logging (goes to CloudWatch)
sdk.log('info', 'Message', { meta: 'data' });
sdk.log('warn', 'Warning message');
sdk.log('error', 'Error occurred', { error: err.message });
```

## Manifest Reference

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Description of the plugin",
  "author": "Your Name",
  "homepage": "https://github.com/you/my-plugin",
  "capabilities": {
    "editor": true,
    "backend": true,
    "renderer": true
  },
  "configSchema": {
    "type": "object",
    "properties": {
      "apiKey": { "type": "string", "description": "API Key" },
      "maxItems": { "type": "number", "default": 10 }
    },
    "required": ["apiKey"]
  },
  "endpoints": [
    { "path": "/items", "method": "GET", "handler": "listItems" },
    { "path": "/items", "method": "POST", "handler": "createItem" },
    { "path": "/items/{id}", "method": "DELETE", "handler": "deleteItem" }
  ],
  "rendererHooks": {
    "beforeConversion": true,
    "afterConversion": true
  },
  "permissions": {
    "dataAccess": true,
    "assetAccess": false
  }
}
```

## Build Process

The build script (`scripts/bundle.js`) uses esbuild to compile:

| File | Format | Platform | Target |
|------|--------|----------|--------|
| backend.js | CJS | Node.js | node20 |
| renderer.js | CJS | Node.js | node20 |
| editor.js | ESM | Browser | es2020 |

External packages (not bundled):
- `@aws-sdk/*` - Available in Lambda runtime
- `@micropress/plugin-sdk` - Provided by MicroPress
- `@tiptap/*` - Provided by admin editor

## Registering a Plugin

Add entry to `registry.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Description",
  "author": "Your Name",
  "repository": "https://github.com/you/my-plugin",
  "downloadUrl": "https://github.com/you/my-plugin/releases/download/v1.0.0/plugin.zip",
  "capabilities": {
    "editor": true,
    "backend": true,
    "renderer": true
  }
}
```

Note: The registry uses `version` and `downloadUrl` fields which are mapped to `latestVersion` and `releaseUrl` internally by MicroPress.

## Testing Locally

1. Build your plugin: `npm run build:zip`
2. The `plugin.zip` file can be manually uploaded or installed via the admin UI
3. Check CloudWatch logs for backend/renderer errors
4. Use browser DevTools for editor plugin debugging

## Best Practices

1. **Keep plugins small** - Bundle only what you need
2. **Handle errors gracefully** - Return proper error responses
3. **Use SDK logging** - Helps with debugging in CloudWatch
4. **Version carefully** - Follow semver for updates
5. **Document your plugin** - Include README with usage instructions
6. **Test before release** - Verify all capabilities work
