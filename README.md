# Namay Prakash — Thumbnail Design Portfolio

This is the complete source export of Namay Prakash's portfolio website.

## Before publishing

Namay's business email is configured in `app/src/routes/index.tsx`. Replace the remaining LinkedIn placeholder when the profile URL is available:

- `linkedin.com/in/your-profile`

## Run locally

The project uses Bun and Vite.

```powershell
cd app
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite may choose the next available port if 5173 is already in use.

## Validate a production build

```powershell
cd app
bun run build
```

## GitHub repository

Run these commands from the folder containing this README:

```powershell
git init
git add .
git commit -m "Initial Namay Prakash portfolio"
git branch -M main
git remote add origin https://github.com/not1n4s/portfolio.namay.git
git push -u origin main
```

The included workflows validate the project and publish the static portfolio on every push to `main`.

## GitHub Pages

The GitHub Pages build enables static prerendering and serves the site from the repository base path. In the repository, open **Settings → Pages** and select **GitHub Actions** as the source.

Production URL: https://namaycreations.vercel.app/

Existing hosted version: https://frame-current-studio.higgsfield.app
