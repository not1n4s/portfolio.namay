# Namay Prakash — Thumbnail Design Portfolio

This is the complete source export of Namay Prakash's portfolio website.

## Before publishing

Replace the two clearly marked placeholders in `app/src/routes/index.tsx`:

- `your-email@example.com`
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

## Put the source on GitHub

Run these commands from the folder containing this README:

```powershell
git init
git add .
git commit -m "Initial Namay Prakash portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

The included GitHub workflow validates the project on pushes to `main`. It was exported from the Higgsfield project and currently names a Higgsfield-specific runner; change `runs-on: arc-runners-frontend` to `runs-on: ubuntu-latest` if your GitHub repository does not provide that runner.

## Hosting note

This is a TanStack Start server-rendered application configured for Cloudflare Workers. GitHub is suitable for storing the source, but GitHub Pages is not the correct runtime for this version. Deploy it through the existing Higgsfield project or a compatible Cloudflare Workers setup.

Current hosted version: https://frame-current-studio.higgsfield.app
