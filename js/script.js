// Dark/light
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Nuke old theme setting from previous visitors
    localStorage.removeItem("theme");

    this.setTheme(this.resolveTheme());

    // Follow system flips while the page is open
    globalThis
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!sessionStorage.getItem("theme")) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
  }

  // Session override wins for the lifetime of this tab; otherwise mirror
  // OS or browser preference on each page load
  resolveTheme() {
    const override = sessionStorage.getItem("theme");
    if (override) return override;
    return globalThis.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  setTheme(theme, persist = false) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    // Only the manual toggle persists
    if (persist) sessionStorage.setItem("theme", theme);
    this.updateThemeToggle(theme);
  }

  toggleTheme() {
    const currentTheme = this.resolveTheme();
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme, true);
  }

  updateThemeToggle(theme) {
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
      themeToggle.setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
      );

      // Click handler
      if (!themeToggle.dataset.handlerAdded) {
        themeToggle.addEventListener("click", () => this.toggleTheme());
        themeToggle.dataset.handlerAdded = "true";
      }
    }
  }
}

// Burger King's hidden menu
class NavigationManager {
  constructor() {
    this.hamburger = document.querySelector(".hamburger");
    this.navLinks = document.querySelector(".nav-links");
    this.init();
  }

  init() {
    if (this.hamburger && this.navLinks) {
      this.hamburger.addEventListener("click", () => this.toggleMobileNav());

      // Burger cancellations
      this.navLinks.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          this.closeMobileNav();
        }
      });

      document.addEventListener("click", (e) => {
        if (!e.target.closest("nav")) {
          this.closeMobileNav();
        }
      });
    }

    this.setActiveNavLink();
  }

  toggleMobileNav() {
    this.hamburger.classList.toggle("active");
    this.navLinks.classList.toggle("active");
  }

  closeMobileNav() {
    this.hamburger.classList.remove("active");
    this.navLinks.classList.remove("active");
  }

  setActiveNavLink() {
    const currentPage =
      globalThis.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (
        href === currentPage ||
        (currentPage === "" && href === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  }
}

// Do it for the Likes
// -------------------
// Real, persisted likes via the Cloudflare Worker at LIKES_API_BASE. Each
// visitor gets a UUID stored in both a first-party cookie AND localStorage
// so clearing just one doesn't lose their identity. The Worker enforces
// "one like per (visitor, article)" and returns the authoritative count
// after every toggle — the client just mirrors what it hears back.

const LIKES_API_BASE = "https://dannybimma-likes.dantrotman92.workers.dev";
const VISITOR_KEY = "visitor_id";
const LIKES_CACHE_KEY = "likesCache";

// Read the visitor cookie if it exists, else return empty string
function readVisitorCookie() {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${VISITOR_KEY}=`));
  return match ? match.slice(VISITOR_KEY.length + 1) : "";
}

// A 10-year first-party cookie holding the visitor id. Secure flag only
// goes applies on HTTPS, so localhost (http) testing still works
function writeVisitorCookie(id) {
  const tenYears = 60 * 60 * 24 * 365 * 10;
  const secure = globalThis.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${VISITOR_KEY}=${id}; Max-Age=${tenYears}; Path=/; SameSite=Lax${secure}`;
}

// Belt-and-braces visitor id: use whichever of cookie/localStorage already has
// it, generate a new UUID if neither does, then mirror the final value back
// into both
function getOrCreateVisitorId() {
  const fromCookie = readVisitorCookie();
  const fromStorage = localStorage.getItem(VISITOR_KEY) || "";
  const id = fromCookie || fromStorage || crypto.randomUUID();
  if (!fromCookie) writeVisitorCookie(id);
  if (!fromStorage) localStorage.setItem(VISITOR_KEY, id);
  return id;
}

class LikeManager {
  constructor() {
    this.visitorId = getOrCreateVisitorId();
    // Stale cache of last-seen counts — paints the UI instantly on load
    // before Worker response comes back
    this.state = this.loadCachedState();
    // Prevent rapid double-clicks from racing two POSTs for the same article
    this.inFlight = new Set();
    this.init();
  }

  init() {
    const buttons = document.querySelectorAll(".like-btn");
    const articleIds = new Set();
    buttons.forEach((btn) => {
      const id = btn.dataset.articleId;
      if (!id) return;
      articleIds.add(id);
      this.paintButton(btn, id);
      btn.addEventListener("click", () => this.toggle(id));
    });
    if (articleIds.size > 0) {
      this.refresh([...articleIds]);
    }
  }

  loadCachedState() {
    try {
      return JSON.parse(localStorage.getItem(LIKES_CACHE_KEY)) || {};
    } catch {
      return {};
    }
  }

  saveCachedState() {
    localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(this.state));
  }

  // Batch GET (one round-trip for every article id on the current page)
  async refresh(ids) {
    const url = new URL(`${LIKES_API_BASE}/likes`);
    url.searchParams.set("ids", ids.join(","));
    url.searchParams.set("visitorId", this.visitorId);
    try {
      const res = await fetch(url.toString());
      if (!res.ok) return;
      const data = await res.json();
      Object.assign(this.state, data);
      this.saveCachedState();
      ids.forEach((id) => this.paintAll(id));
    } catch (err) {
      // Gracefully handle likes failing to load
      console.warn("likes: failed to load counts", err);
    }
  }

  // Toggle flow: flip the UI optimistically, POST to the Worker, reconcile
  // with the authoritative response (or revert if the request failed)
  async toggle(articleId) {
    if (this.inFlight.has(articleId)) return;
    this.inFlight.add(articleId);

    const before = this.state[articleId] || { count: 0, liked: false };
    const optimistic = {
      liked: !before.liked,
      count: Math.max(0, before.count + (before.liked ? -1 : 1)),
    };
    this.state[articleId] = optimistic;
    this.paintAll(articleId);

    try {
      const res = await fetch(
        `${LIKES_API_BASE}/likes/${encodeURIComponent(articleId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: this.visitorId }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.state[articleId] = data;
      this.saveCachedState();
      this.paintAll(articleId);
      // 69 Easter egg for the console
      if (data.liked) {
        console.log("%c+69? Nice! 420? Blaze it!!", "color:#ff69b4;font-weight:700");
      }
    } catch (err) {
      console.warn("likes: toggle failed, reverting", err);
      this.state[articleId] = before;
      this.paintAll(articleId);
    } finally {
      this.inFlight.delete(articleId);
    }
  }

  paintAll(articleId) {
    document
      .querySelectorAll(`.like-btn[data-article-id="${articleId}"]`)
      .forEach((btn) => this.paintButton(btn, articleId));
  }

  paintButton(button, articleId) {
    const data = this.state[articleId] || { count: 0, liked: false };
    const likeCount = button.parentElement.querySelector(".like-count");
    button.classList.toggle("liked", data.liked);
    button.innerHTML = `${data.liked ? "❤️" : "🤍"} ${data.liked ? "Liked" : "Like"}`;
    if (likeCount) {
      likeCount.textContent = `${data.count} like${data.count !== 1 ? "s" : ""}`;
    }
  }
}

// Contact Form
class ContactFormManager {
  constructor() {
    this.form = document.querySelector(".contact-form");
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    // Validation (weak)
    if (!name || !email || !message) {
      this.showMessage("Please fill in all fields.", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return;
    }

    // Create mailto link (site is static)
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    );
    const mailtoLink = `mailto:dantrotman92@gmail.com?subject=${subject}&body=${body}`;

    globalThis.location.href = mailtoLink;

    this.showMessage("Opening your email client...", "success");
    this.form.reset();
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Msg box
  showMessage(text, type) {
    const existingMessage = document.querySelector(".form-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const message = document.createElement("div");
    message.className = `form-message ${type}`;
    message.textContent = text;
    message.style.cssText = `
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 4px;
      font-weight: 700;
      background-color: ${type === "error" ? "var(--warning-color)" : "var(--success-color)"
      };
      color: white;
    `;

    this.form.appendChild(message);

    // 5 sec timeout
    setTimeout(() => {
      if (message.parentElement) {
        message.remove();
      }
    }, 5000);
  }
}

// Smooth scroll for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Peep dem fade-in animations
function initFadeInAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in");
        }
      });
    },
    {
      threshold: 0.1,
    },
  );

  document
    .querySelectorAll("main > *, .article-list li, .project-list li")
    .forEach((el) => {
      observer.observe(el);
    });
}

// Init on DOM's load
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
  new NavigationManager();
  new LikeManager();
  new ContactFormManager();
  initSmoothScroll();
  initFadeInAnimations();
});

// Easter egg for devs
console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║    ~ welcome to my personal blog and dev portfolio                         ║
║    > i am the man who will one day become King of the Coders               ║
║    > i think genAI should be used in code/math/science but banned from art ║
║    > if you are reading this, you're probably a nerd; so hit me up 😁✌🏾     ║
║                                                                            ║
║    GitHub: https://github.com/dannyBimma/                                  ║
║    Threads: https://www.threads.com/@danny_bimma                           ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
