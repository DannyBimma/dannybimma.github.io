# DannyBimma's Blog - Minimalist Developer Portfolio

A minimalist blog and developer portfolio built with vanilla HTML, CSS, and JavaScript, featuring a terminal/CLI-inspired design.

## 🚀 Features

### Design & UI

- **Terminal/CLI Aesthetic**: Clean, minimalist design inspired by command-line interfaces
- **Dark/Light Mode**: Automatic theme detection with manual toggle, using `prefers-color-scheme`
- **Responsive Design**: Mobile-first approach with collapsible hamburger navigation
- **Space Mono Font**: Google Fonts integration for that authentic monospace feel

### Functionality

- **Sticky Navigation**: Header stays visible while scrolling, collapses on mobile
- **Like System**: Real per-article like counts backed by a Cloudflare Worker + KV, with per-visitor unlike support (visitor id stored in a first-party cookie + localStorage)
- **Contact Form**: Email integration using mailto links with form validation
- **Smooth Animations**: Fade-in effects and smooth transitions
- **SEO Optimized**: Proper meta tags, semantic HTML, and Open Graph tags

### Pages

- **Home**: Latest blog post with full content and author information
- **Articles**: Archive of all blog posts with like counters
- **Projects**: Showcase of developer projects with GitHub links
- **About**: Personal bio and contact form

### Technical Stack

- **HTML5**: Semantic markup with proper accessibility
- **CSS3**: Modern CSS with CSS Variables, Grid, and Flexbox
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript
- **Cloudflare Worker + KV**: Serverless backend for the likes system (see `worker/`)
- **localStorage + cookies**: Client-side persistence for theme preference and the anonymous visitor id

## 📁 Project Structure

```
dannybimma.github.io/
├── index.html              # Home page with latest article
├── articles.html           # Article archive listing
├── projects.html           # Developer projects showcase
├── about.html              # Bio and contact information
├── 404.html                # Error page (root-absolute paths — see file header)
├── .htaccess               # Apache config: HTTPS, security headers, gzip, caching
├── robots.txt
├── sitemap.xml
├── css/
│   └── style.css           # Main stylesheet with themes
├── js/
│   └── script.js           # Interactive functionality (theme, nav, likes)
├── assets/
│   ├── images/             # Image assets
│   └── videos/
├── archives/               # Archived blog articles
├── scripts/
│   └── build-redirects.sh  # Generates the gh-pages redirect stubs
├── .github/workflows/
│   └── deploy.yml          # Bluehost upload + redirect-stub publish
└── worker/                 # Cloudflare Worker + KV backend for likes
    ├── src/index.js
    └── wrangler.toml
```

Everything above `scripts/` ships to Bluehost. `scripts/`, `.github/`, `worker/`, `README.md`, and `LICENSE` are stripped out at deploy time.

## 🛠️ Setup & Usage

### Local Development

1. Clone the repository
2. `python3 -m http.server 8000`
3. Open <http://localhost:8000>

No build process required. Serve it rather than opening `index.html` off disk — over `file://` the CSP blocks the stylesheet and the likes fetch, so the page renders unstyled and the buttons do nothing. Port 8000 matters too: it's what the Worker's CORS allow-list expects.

### Customization

1. **Theme Colors**: Modify CSS variables in `:root` and `[data-theme="light"]`
2. **Content**: Update HTML files with your own information
3. **Projects**: Add your GitHub repositories to `projects.html`
4. **Articles**: Create new articles in the `archives/` folder

### Adding New Articles

1. Create a new HTML file in the `archives/` folder
2. Use the same structure as `css-grid-mastery.html`
3. Update `articles.html` to include a link to your new article
4. Add a unique `data-article-id` for the like system (lowercase kebab-case, matching `/^[a-z0-9][a-z0-9-]{0,63}$/`). New ids are created lazily in KV the first time someone likes the article — no Worker changes needed.

## 🎨 Design Philosophy

This blog embraces the **terminal aesthetic** with:

- Monospace typography (Space Mono)
- Dark color scheme with high contrast
- Minimal, functional design elements
- Command-line inspired prompts (`$` in logo, `//` in metadata)
- Clean borders and geometric layouts

## 📱 Mobile Experience

- Responsive design that works on all screen sizes
- Hamburger menu for mobile navigation
- Touch-friendly buttons and links
- Optimized typography and spacing

## 🔧 Browser Support

- **Modern Browsers**: Full feature support (Chrome, Firefox, Safari, Edge)
- **CSS Grid**: Primary layout method with flexbox fallbacks
- **localStorage + cookies**: Theme preference and anonymous visitor id persist across sessions. Real like counts live on the Worker, not the browser.
- **ES6+ JavaScript**: Modern JavaScript features with graceful degradation

## 🚀 Deployment

The site lives at **[dannybimma.blog](https://dannybimma.blog)**, hosted on **Bluehost** (Apache shared hosting), with the domain registered at GoDaddy.

Push to `main` and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) does both halves of the deploy:

1. **Bluehost** — stages the tracked files into a clean tree (`git archive`, minus `worker/`, `scripts/`, and repo furniture) and mirrors it to `public_html` over SFTP with `lftp`.
2. **GitHub Pages** — regenerates the redirect stubs and force-pushes them to the `gh-pages` branch. The old `dannybimma.github.io` address serves nothing but redirects to the new domain now.

### Required repository secrets

| Secret | What it is |
| --- | --- |
| `BLUEHOST_HOST` | SFTP hostname, e.g. `dannybimma.blog` or the server hostname from cPanel |
| `BLUEHOST_USER` | cPanel / SSH username |
| `BLUEHOST_PATH` | Site root on the server, normally `public_html` |
| `BLUEHOST_PORT` | SSH port (optional, defaults to `22`) |
| `BLUEHOST_SSH_KEY` | Private half of a deploy keypair |
| `BLUEHOST_KNOWN_HOSTS` | Output of `ssh-keyscan -p 22 <host>`, so the host key is pinned |

The mirror runs with `--delete`, so **the server is made to match the repo exactly** — anything sitting in `public_html` that isn't in the repo gets removed. The workflow refuses to run if `BLUEHOST_PATH` is empty or set to something as broad as `/` or `~`.

To preview a deploy without writing anything, run the workflow manually from the Actions tab with **dry run** ticked.

### Apache config

[`.htaccess`](.htaccess) does the things GitHub Pages used to handle invisibly, plus the one thing it couldn't:

- Forces HTTPS and strips `www`
- Sets **real** security headers — CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` — instead of the `<meta http-equiv>` approximations Pages forced
- gzip via `mod_deflate`, cache lifetimes via `mod_expires`
- `ErrorDocument 404 /404.html`

The CSP in `.htaccess` and the `<meta>` copies in the HTML files must be kept in sync. If they disagree, browsers enforce whichever is stricter and you get a blocked resource with no obvious cause.

### Local development

```sh
python3 -m http.server 8000
```

Port 8000 specifically — it's on the Worker's CORS allow-list, so likes work locally.

## 📞 Contact Information

- **Email**: dantrotman92@gmail.com
- **GitHub**: [@dannyBimma](https://github.com/dannyBimma/)
- **Threads**: [@danny_bimma](https://www.threads.com/@danny_bimma)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using vanilla web technologies**
