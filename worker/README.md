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
- Per-IP sliding window: 30 toggle requests per 60 seconds.
- CORS locked to `dannybimma.github.io` (plus localhost for dev).
