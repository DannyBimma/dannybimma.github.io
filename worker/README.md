# Likes Worker

Cloudflare Worker + KV backing the blog's likes system.

## Endpoints

- `GET /likes?ids=a,b,c&visitorId=<uuid>` — returns `{ id: { count, liked }, ... }` for each article id. `visitorId` is optional; when omitted, `liked` is always false.
- `POST /likes/:articleId` with body `{"visitorId":"<uuid>"}` — toggles the caller's like for that article, returns `{ count, liked }`.

## One-time setup

```sh
cd worker
npm install
npx wrangler login
npx wrangler kv:namespace create LIKES
# copy the printed id into wrangler.toml
npx wrangler deploy
```

`wrangler deploy` prints the public URL (e.g. `https://dannybimma-likes.<account>.workers.dev`). Paste it into `js/script.js` as `LIKES_API_BASE`.

## Abuse controls

- Article ids must match `/^[a-z0-9][a-z0-9-]{0,63}$/`.
- Visitor ids must be RFC-4122 UUIDs.
- Per-IP sliding window: 30 toggle requests per 60 seconds (and 120 reads per 60 seconds).
- CORS locked to an allow-list in `src/index.js`: `dannybimma.blog`, `www.dannybimma.blog`, `dannybimma.github.io`, plus localhost for dev.

## After the move to Bluehost

The Worker stayed on Cloudflare when the site moved to Bluehost — shared hosting has no serverless runtime, and KV has no equivalent there. The only thing the move changed is the CORS allow-list.

Two things worth knowing:

- **The allow-list is the whole security boundary.** If you ever add another domain for the site, add it to `ALLOWED_ORIGINS` and redeploy, or likes will silently fail with a CORS error in the console and no visible UI change.
- **`dannybimma.github.io` is still allowed**, only so nothing breaks mid-DNS-propagation. Once the old domain is serving nothing but redirect stubs, drop it from the list and redeploy — it's one less origin that can talk to your KV.

Redeploy after any change with:

```sh
cd worker && npx wrangler deploy
```
