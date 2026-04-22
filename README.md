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
blog-page/
├── index.html              # Home page with latest article
├── articles.html           # Article archive listing
├── projects.html           # Developer projects showcase
├── about.html              # Bio and contact information
├── css/
│   └── style.css           # Main stylesheet with themes
├── js/
│   └── script.js           # Interactive functionality (theme, nav, likes)
├── assets/
│   ├── images/             # Image assets
│   └── videos/
├── archives/               # Archived blog articles
└── worker/                 # Cloudflare Worker + KV backend for likes
    ├── src/index.js
    └── wrangler.toml
```

## 🛠️ Setup & Usage

### Local Development

1. Clone or download the repository
2. Open `index.html` in your browser
3. No build process required - works immediately!

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

This is a static site that can be deployed anywhere:

- **GitHub Pages**: Simply push to a repository with Pages enabled
- **Netlify**: Drag and drop the folder for instant deployment
- **Vercel**: Connect your repository for automatic deployments
- **Any Web Server**: Upload files to any hosting provider

## 📞 Contact Information

- **Email**: dantrotman92@gmail.com
- **GitHub**: [@dannyBimma](https://github.com/dannyBimma/)
- **Threads**: [@danny_bimma](https://www.threads.com/@danny_bimma)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using vanilla web technologies**
