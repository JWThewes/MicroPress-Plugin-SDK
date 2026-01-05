# MicroPress Plugin SDK

SDK for building MicroPress plugins.

## Installation

```bash
npm install @micropress/plugin-sdk
```

## Usage

```typescript
import { PluginSDK, PluginManifest } from '@micropress/plugin-sdk';

// In your plugin's backend code
export async function handler(sdk: PluginSDK, event: any) {
  // Store data
  await sdk.putData('my-key', { value: 'hello' });
  
  // Retrieve data
  const data = await sdk.getData('my-key');
  
  // Log activity
  sdk.log('info', 'Plugin executed successfully');
  
  return { success: true, data };
}
```

## API Reference

See TypeScript definitions in `dist/index.d.ts`.

## Plugin Structure

A plugin consists of:
- `manifest.json` - Plugin metadata
- `editor.js` (optional) - Browser bundle for TipTap extension
- `backend.ts` (optional) - API endpoint handlers
- `renderer.ts` (optional) - Content transformation during publish

## License

MIT
