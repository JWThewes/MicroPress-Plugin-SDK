# GitHub Actions & npm Publishing - Setup Complete ✅

## What Was Added

### GitHub Actions Workflow
**File**: `.github/workflows/publish.yml`

**Triggers**:
- Push to `main` branch → Build only
- Push tag `v*` → Build + Publish to npm
- Pull requests → Build only

**Steps**:
1. Checkout code
2. Setup Node.js 20
3. Install dependencies (`npm ci`)
4. Build SDK (`npm run build`)
5. Publish to npm (only on version tags)

### npm Package Configuration
**Files**:
- `sdk/.npmignore` - Excludes source files from package
- `sdk/package.json` - Added repository info and files array

**Package includes**:
- `dist/` - Compiled JavaScript and type definitions
- `README.md` - Documentation

## Setup Instructions

### 1. Create GitHub Repository
```bash
cd /Users/janthewes/development/MicroPress-plugins
git init
git add .
git commit -m "feat: initial plugin SDK with GitHub Actions"
```

Create repo at https://github.com/new:
- Name: `MicroPress-plugins`
- Public repository
- No README/license (already exists)

```bash
git remote add origin https://github.com/YOUR_USERNAME/MicroPress-plugins.git
git branch -M main
git push -u origin main
```

### 2. Setup npm Trusted Publishing

**Create npm account**: https://www.npmjs.com/signup

**First publish manually** (package must exist before configuring trusted publishing):
```bash
cd sdk
npm login
npm publish --access public
```

**Then configure trusted publisher**:
1. Go to https://www.npmjs.com/package/@micropress/plugin-sdk/access
2. Click "Publishing access" → "Trusted publishers"
3. Click "Add trusted publisher"
4. Fill in:
   - Provider: GitHub Actions
   - Repository owner: YOUR_USERNAME
   - Repository name: MicroPress-plugins
   - Workflow name: publish.yml
   - Environment name: (leave empty)
5. Click "Add"

**Update repository URLs**:
```bash
cd sdk
# Replace YOUR_USERNAME with your GitHub username
sed -i '' 's/YOUR_USERNAME/your-actual-username/g' package.json
cd ..
sed -i '' 's/YOUR_USERNAME/your-actual-username/g' README.md
git commit -am "chore: update repository URLs"
git push
```

### 3. Publish First Version

```bash
cd sdk
npm version 0.1.0  # Creates git tag v0.1.0
cd ..
git push origin main --tags
```

GitHub Actions will automatically:
- Build the SDK
- Publish to npm as `@micropress/plugin-sdk`

### 4. Verify Publication

Check npm: https://www.npmjs.com/package/@micropress/plugin-sdk

Test installation:
```bash
npm install @micropress/plugin-sdk
```

## Usage by Plugin Developers

After publishing, developers can use:

```bash
npm install @micropress/plugin-sdk
```

```typescript
import { PluginSDK, PluginManifest } from '@micropress/plugin-sdk';
```

## Publishing Updates

```bash
cd sdk
npm version patch  # 0.1.0 → 0.1.1 (bug fixes)
# or
npm version minor  # 0.1.0 → 0.2.0 (new features)
# or
npm version major  # 0.1.0 → 1.0.0 (breaking changes)

cd ..
git push origin main --tags
```

## Files Added

- `.github/workflows/publish.yml` - GitHub Actions workflow
- `sdk/.npmignore` - npm package exclusions
- `PUBLISHING.md` - Detailed publishing guide

## Files Modified

- `sdk/package.json` - Added repository and files config
- `README.md` - Added build and npm badges

---

**Status**: Ready to push to GitHub and publish to npm
