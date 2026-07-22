# TMAsnaps

A simple public photo/video/text wall. Anyone with the link can post and view — no login, no database to manage. Runs entirely on Vercel's free tier.

## 1. Push this to GitHub

```bash
git init
git add .
git commit -m "TMAsnaps"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/tmasnaps.git
git push -u origin main
```

## 2. Import into Vercel

1. Go to https://vercel.com → **Add New → Project** → import your `tmasnaps` GitHub repo.
2. Leave the framework preset as **Other** — no build settings needed. Click **Deploy**.

## 3. Turn on Blob storage (this is where posts and media actually live)

1. In your new Vercel project, go to the **Storage** tab → **Create Database** → **Blob**.
2. Accept the default name and connect it to your project. Vercel automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable — you don't need to copy anything yourself.
3. Go to **Deployments**, open the latest one, and click **Redeploy** so the function picks up the new token.

That's it. Your site is live at the `.vercel.app` URL Vercel gives you (and you can attach a custom domain for free under **Settings → Domains** if you own one).

## How it works

- `index.html` — the whole UI, loaded from wherever it's hosted.
- `api/upload.js` — hands out a short-lived token so the browser can upload files straight to Blob storage (keeps uploads fast, no size limit worries from the server).
- `api/posts.js` — reads/writes the list of posts as small JSON files in Blob storage.
- The feed polls every 6 seconds so new posts show up for everyone without needing a refresh.

## Limits and notes

- Vercel's free Hobby plan includes a solid Blob storage allowance (usage-based, generous for personal use) and unlimited static hosting with no sleep/spin-down — a static site plus small functions doesn't idle out.
- As built, **anyone with the link can post and delete anything** — there's no login. Fine for friends; if you share it widely later, that's the point to add basic auth.
- No plan, free or paid, comes with a literal 100%-uptime guarantee — but Vercel's static hosting is about as close to "set it and forget it" as free hosting gets.
