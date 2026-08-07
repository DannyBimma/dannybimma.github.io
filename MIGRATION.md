# Migration runbook: GitHub Pages → GoDaddy domain + Bluehost

Everything in the repo is already done. What's left is the dashboard work, which needs your logins.

Do it in this order. The ordering is the point — it's arranged so the site is live on Bluehost *before* DNS moves, which means no downtime window where the domain resolves somewhere with nothing on it.

---

## Before you start: one thing to check

**Do you have email on `dannybimma.blog`?** (Anything like `hi@dannybimma.blog`.)

If yes, **do not change nameservers** — use Option B in step 3. Moving nameservers moves *all* DNS records including MX, and your mail stops arriving until you recreate those records at Bluehost. If the domain is web-only, Option A is simpler.

---

## 1. Add the domain to Bluehost

In Bluehost: **Domains → Add Domain**, enter `dannybimma.blog`, and choose "I already own this domain" (or "Assign"). Bluehost will say DNS isn't pointing at it yet — that's expected, ignore it for now.

Note down, from cPanel:

- The **server IP address** (cPanel sidebar, "Shared IP Address")
- Your **cPanel username**
- The **SSH hostname** (usually the same server hostname)

## 2. Set up SSH access and the deploy key

Enable SSH access in Bluehost (**Advanced → SSH Access**; on some plans you have to ask support to turn it on).

Then generate a keypair **just for deploys** — don't reuse a personal key:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/bluehost_deploy -C "github-actions deploy" -N ""
```

Upload the **public** half (`~/.ssh/bluehost_deploy.pub`) to Bluehost via cPanel → SSH Access → Manage SSH Keys → Import, then **authorize** it. Importing alone isn't enough; there's a separate "Manage → Authorize" step that people miss.

Verify it works before going further:

```sh
ssh -i ~/.ssh/bluehost_deploy <cpanel-user>@<ssh-host>
```

Then capture the host key for pinning:

```sh
ssh-keyscan -p 22 <ssh-host>
```

## 3. Add the GitHub secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
| --- | --- |
| `BLUEHOST_HOST` | the SSH hostname from step 1 |
| `BLUEHOST_USER` | your cPanel username |
| `BLUEHOST_PATH` | `public_html` |
| `BLUEHOST_PORT` | `22` (skip if it's 22) |
| `BLUEHOST_SSH_KEY` | full contents of `~/.ssh/bluehost_deploy` (the private one, including the `BEGIN`/`END` lines) |
| `BLUEHOST_KNOWN_HOSTS` | the full `ssh-keyscan` output from step 2 |

## 4. Deploy to Bluehost while DNS still points at the old place

Commit and push everything in this repo, then go to **Actions → Deploy → Run workflow**, tick **dry run**, and run it.

Read the log. It lists every file it *would* upload and delete. Confirm it looks like your site and that it isn't proposing to delete something of yours that lives in `public_html`.

Then run it again with dry run **off**.

Check the result on Bluehost's temporary URL (cPanel shows it, usually something like `https://<ip>/~<cpanel-user>/`), or by adding a line to your local `/etc/hosts`:

```
<bluehost-ip>   dannybimma.blog www.dannybimma.blog
```

> On the temporary `/~username/` URL the CSS and JS will 404 — the site is built for a domain root, not a subfolder. That's expected and not a bug. The `/etc/hosts` method gives you a true preview; prefer it.

Remove the `/etc/hosts` line when you're done testing.

## 5. Point DNS at Bluehost

### Option A — move nameservers (simplest, web-only domains)

At GoDaddy: **My Products → dannybimma.blog → DNS → Nameservers → Change → Enter my own nameservers**:

```
ns1.bluehost.com
ns2.bluehost.com
```

### Option B — keep DNS at GoDaddy (do this if you have email on the domain)

At GoDaddy, leave the nameservers alone and edit the records:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `<bluehost-ip>` | 600 |
| CNAME | `www` | `dannybimma.blog` | 600 |

Delete any existing `A` or `CNAME` on `@` and `www` that point at GitHub (`185.199.108-111.153`, or `dannybimma.github.io`). Leave every `MX` and `TXT` record exactly as it is.

Drop TTL to 600 a day *before* the switch if you can — it makes the cutover propagate in minutes instead of hours.

## 6. Wait for SSL

Once DNS resolves to Bluehost, AutoSSL issues a Let's Encrypt certificate. Usually minutes, occasionally a few hours. Watch cPanel → **SSL/TLS Status**.

> **If you get a certificate error in this window:** `.htaccess` forces HTTPS, so an unissued cert makes the site look broken rather than merely insecure. Temporarily comment out the `RewriteCond`/`RewriteRule` pair under "Force HTTPS" in `.htaccess`, push, and uncomment it once the cert lands. Don't leave it off — the HSTS header below it only means anything with a working cert.

Confirm with:

```sh
curl -sI https://dannybimma.blog | head -20
```

You want `HTTP/2 200`, plus the `content-security-policy`, `strict-transport-security`, and `x-content-type-options` headers.

## 7. Switch GitHub Pages to the redirect branch

The deploy workflow already pushed a `gh-pages` branch full of redirect stubs. Now tell Pages to serve it:

Repo → **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `gh-pages` / `(root)`** → Save.

This is what makes old `dannybimma.github.io` links forward to the new domain instead of serving a stale duplicate of the site.

Verify:

```sh
curl -s https://dannybimma.github.io/archives/ai-is-cocaine.html | grep canonical
```

## 8. Redeploy the Worker

The CORS allow-list changed, so the likes system needs a redeploy or every like will fail with a CORS error:

```sh
cd worker && npx wrangler deploy
```

Then load an article on the new domain, open DevTools, click a like button, and confirm you get a `200` from the Worker rather than a CORS error.

## 9. Tell Google

In [Search Console](https://search.google.com/search-console):

1. Add and verify `dannybimma.blog` as a new property.
2. Submit `https://dannybimma.blog/sitemap.xml`.
3. On the **old** `dannybimma.github.io` property, use **Settings → Change of address** to point at the new domain.

The canonical tags in the redirect stubs do the real work here; this just speeds it up.

---

## After everything is confirmed working

- Remove `"https://dannybimma.github.io"` from `ALLOWED_ORIGINS` in `worker/src/index.js` and redeploy — one less origin with access to your KV.
- Consider bumping `Strict-Transport-Security` to add `includeSubDomains`, once you're sure no subdomain will ever need plain HTTP.

## Rollback

If something goes badly wrong, revert DNS at GoDaddy to the GitHub Pages records and set Pages back to serving `main`:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

The one thing that doesn't roll back cleanly is HSTS: any browser that has already seen the header will refuse plain HTTP for that domain for a year. It'll be fine as long as whatever you roll back to still serves HTTPS, which GitHub Pages does.
