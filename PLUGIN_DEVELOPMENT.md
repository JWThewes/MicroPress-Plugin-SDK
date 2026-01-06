# Plugin Development Guide

## Quick Start

1. Clone template: `git clone https://github.com/your-org/plugin-template`
2. Update `manifest.json`
3. Implement in `src/`
4. Build: `npm run build`
5. Release: `git tag v1.0.0 && git push --tags`
6. Register in `registry.json`

## Plugin Types

### Editor Plugin
- File: `src/editor.ts`
- Export: TipTap Node/Mark/Extension
- Loaded in admin interface

### Backend Plugin
- File: `src/backend.ts`
- Export: Named functions matching manifest endpoints
- Receives: `(event, sdk: PluginSDK)`

### Renderer Plugin
- File: `src/renderer.ts`
- Exports: `beforeConversion`, `afterConversion`, `injectAssets`
- Runs during static site generation

## SDK Usage

```typescript
import { PluginSDK } from '@micropress/plugin-sdk';

// Store data
await sdk.putData('key', { foo: 'bar' });

// Retrieve data
const data = await sdk.getData('key');

// List keys
const keys = await sdk.listData('prefix-');

// Read pages/news
const page = await sdk.getPage('page-id');

// Logging
sdk.log('info', 'Message', { meta: 'data' });
```

## Manifest Reference

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Description",
  "author": "Author",
  "capabilities": {
    "editor": true,
    "backend": true,
    "renderer": true
  },
  "configSchema": {
    "type": "object",
    "properties": {}
  },
  "endpoints": [
    { "path": "/items", "method": "GET", "handler": "listItems" }
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

## Registering a Plugin

Add entry to `registry.json`:

```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "description": "Description",
  "latestVersion": "1.0.0",
  "githubRepo": "your-org/my-plugin",
  "releaseUrl": "https://github.com/your-org/my-plugin/releases/download/v1.0.0/plugin.zip"
}
```
