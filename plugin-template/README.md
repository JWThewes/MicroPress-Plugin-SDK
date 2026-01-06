# Plugin Template

Template for creating MicroPress plugins.

## Quick Start

1. Clone this template
2. Update `manifest.json` with your plugin details
3. Implement your plugin in `src/`
4. Build: `npm run build`
5. Release: `git tag v1.0.0 && git push --tags`

## Structure

- `src/editor.ts` - TipTap extension (optional)
- `src/backend.ts` - Lambda handlers (optional)
- `src/renderer.ts` - HTML transformation hooks (optional)

## Building

```bash
npm install
npm run build
```

Output goes to `dist/` directory.
