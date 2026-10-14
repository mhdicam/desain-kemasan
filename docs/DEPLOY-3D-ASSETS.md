# Deploying 3D models

A `git pull` updates source files, **not** the already-built Vite `dist` directory.

For a normal source checkout deployment:

```bash
git pull origin main
npm ci
npm run build
test -s dist/model-assets/manifest.json
test -s dist/model-assets/can-label/assembled.glb
file dist/model-assets/can-label/assembled.glb
```

Then ensure Nginx serves **the same** freshly built `dist` directory. If the Nginx site root points elsewhere, copy/symlink carefully according to the deployment setup and reload if configuration changed. Confirm browser HTTP URLs `/model-assets/manifest.json` and `/model-assets/can-label/assembled.glb` return 200, not SPA HTML fallback. For Vite subpath deployments, use the Vite base prefix in requests.

Can Label is reference/preview only and has not passed interactive browser artwork acceptance yet.
