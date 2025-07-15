# GitHub Actions Setup for Claude-Flow

## Overview

This document explains how Claude-Flow uses GitHub Actions to properly download dependencies that were previously blocked by firewall restrictions, eliminating the need for manual workarounds.

## Problem Solved

Previously, the project used environment variables like `PUPPETEER_SKIP_DOWNLOAD=true` to bypass firewall blocks when downloading:
- Chrome/Chromium for Puppeteer testing
- Deno runtime for dual-runtime features

This approach had limitations:
- Tests couldn't actually use Chrome (just skipped downloads)
- Deno features were unavailable in CI/CD
- Complex workaround scripts were needed

## New Solution

GitHub Actions now properly sets up all dependencies **before** firewall restrictions apply:

### 1. Chrome/Chromium Setup
```yaml
- name: Setup Chrome for Puppeteer
  uses: browser-actions/setup-chrome@latest
  with:
    chrome-version: latest
```

### 2. Deno Runtime Setup
```yaml
- name: Setup Deno
  uses: denoland/setup-deno@v1
  with:
    deno-version: v1.x
```

### 3. Node.js Setup (with caching)
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: ${{ env.NODE_VERSION }}
    cache: 'npm'
```

## Benefits

✅ **Clean Dependencies**: No more `PUPPETEER_SKIP_DOWNLOAD` workarounds
✅ **Full Testing**: Puppeteer tests can actually use Chrome
✅ **Dual Runtime**: Both Node.js and Deno work properly in CI
✅ **Faster CI**: Cached dependencies and proper setup
✅ **Reliable**: No dependency on external firewall configurations

## Updated Files

### `.github/workflows/ci.yml`
- Added Chrome setup action for all jobs that need testing
- Added Deno setup action for dual-runtime support
- Proper dependency caching

### `package.json`
- Removed `PUPPETEER_SKIP_DOWNLOAD=true` from all test scripts
- Clean test commands without firewall workarounds

### `.npmrc`
- Removed Puppeteer download skipping
- Kept essential network timeout settings

### `scripts/install.js`
- Simplified Deno installation for local development
- Removed complex firewall workaround logic

## Local Development

For local development, you may still need:
```bash
# If you encounter firewall issues locally
PUPPETEER_SKIP_DOWNLOAD=true npm install

# For running tests locally without Chrome
npm test
```

But in GitHub Actions, everything works automatically with proper setup.

## Usage in Other Projects

To use this pattern in other projects:

1. Add the setup actions to your workflow before dependency installation
2. Remove any `PUPPETEER_SKIP_DOWNLOAD` environment variables from scripts
3. Test that your CI pipeline can now access all required dependencies

This approach is much cleaner and more reliable than trying to work around firewall restrictions at runtime.