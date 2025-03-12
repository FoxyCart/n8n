# Updating n8n

This document outlines the process for updating the n8n codebase.

## Update Process

1. **Create a new branch**
   - Checkout from `main` to a branch named following the format `feature/update-YYYY-MM-DD`

2. **Pull upstream changes**
   - From your branch, pull from `upstream/master`
   - Resolve any conflicts (there will likely be some)

3. **Handle dependencies**
   - Remove `pnpm-lock.yaml` from the branch as it will have many merge conflicts
   - Run `pnpm reset` to ensure the branch is in a clean state (this will reinstall all dependencies)

4. **Build and test**
   - Run `pnpm build` to build the project
   - Run `pnpm start` and check for any issues

## Prerequisites

- Make sure you have `python-setuptools` installed
  - If not installed, run `pip install python-setuptools`
  - On macOS with Homebrew, run `brew install python-setuptools`
