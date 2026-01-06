# Publishing the SDK

## First Time Setup

### 1. Create npm Account
Sign up at https://www.npmjs.com/signup

### 2. First Manual Publish

The package must exist on npm before configuring trusted publishing:

```bash
cd sdk
npm login
npm run build
npm publish --access public
```

### 3. Configure Trusted Publishing

1. Go to https://www.npmjs.com/package/@micropress/plugin-sdk/access
2. Click "Publishing access" → "Trusted publishers"
3. Click "Add trusted publisher"
4. Fill in:
   - **Provider**: GitHub Actions
   - **Repository owner**: YOUR_USERNAME
   - **Repository name**: MicroPress-plugins
   - **Workflow name**: publish.yml
   - **Environment name**: (leave empty)
5. Click "Add"

### 4. Update Repository URLs
Replace `YOUR_USERNAME` in:
- `sdk/package.json`
- `README.md`

## Publishing Updates

### Automatic (Recommended)

1. Update version:
   ```bash
   cd sdk
   npm version patch  # or minor, or major
   ```

2. Push tag:
   ```bash
   git push origin main --tags
   ```

3. GitHub Actions will automatically build and publish

### Manual

```bash
cd sdk
npm run build
npm publish --provenance --access public
```

## Version Guidelines

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes
