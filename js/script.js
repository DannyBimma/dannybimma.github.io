// Theme Management
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    // Check for saved theme or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(systemPrefersDark ? "dark" : "light");
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
  }

  setTheme(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
    this.updateThemeToggle(theme);
  }

  toggleTheme() {
    const currentTheme = localStorage.getItem("theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  updateThemeToggle(theme) {
    const themeToggle = document.querySelector(".theme-toggle");
    if (themeToggle) {
      themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
      themeToggle.setAttribute(
        "aria-label",
        `Switch to ${theme === "dark" ? "light" : "dark"} mode`
      );

      // Add click handler if not already added
      if (!themeToggle.dataset.handlerAdded) {
        themeToggle.addEventListener("click", () => this.toggleTheme());
        themeToggle.dataset.handlerAdded = "true";
      }
    }
  }
}

// Navigation Management
class NavigationManager {
  constructor() {
    this.hamburger = document.querySelector(".hamburger");
    this.navLinks = document.querySelector(".nav-links");
    this.init();
  }

  init() {
    if (this.hamburger && this.navLinks) {
      this.hamburger.addEventListener("click", () => this.toggleMobileNav());

      // Close mobile nav when clicking on a link
      this.navLinks.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          this.closeMobileNav();
        }
      });

      // Close mobile nav when clicking outside
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
      window.location.pathname.split("/").pop() || "index.html";
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

// Like System
class LikeManager {
  constructor() {
    this.likes = this.loadLikes();
    this.init();
  }

  init() {
    const likeButtons = document.querySelectorAll(".like-btn");
    likeButtons.forEach((btn) => {
      const articleId = btn.dataset.articleId;
      if (articleId) {
        this.updateLikeButton(btn, articleId);
        btn.addEventListener("click", () => this.toggleLike(articleId));
      }
    });
  }

  loadLikes() {
    try {
      return JSON.parse(localStorage.getItem("blogLikes")) || {};
    } catch {
      return {};
    }
  }

  saveLikes() {
    localStorage.setItem("blogLikes", JSON.stringify(this.likes));
  }

  toggleLike(articleId) {
    if (!this.likes[articleId]) {
      this.likes[articleId] = { count: 0, liked: false };
    }

    if (this.likes[articleId].liked) {
      this.likes[articleId].count = Math.max(
        0,
        this.likes[articleId].count - 1
      );
      this.likes[articleId].liked = false;
    } else {
      this.likes[articleId].count += 1;
      this.likes[articleId].liked = true;
    }

    this.saveLikes();
    this.updateAllLikeButtons(articleId);
  }

  updateAllLikeButtons(articleId) {
    const buttons = document.querySelectorAll(
      `[data-article-id="${articleId}"]`
    );
    buttons.forEach((btn) => this.updateLikeButton(btn, articleId));
  }

  updateLikeButton(button, articleId) {
    const likeData = this.likes[articleId] || { count: 0, liked: false };
    const likeCount = button.parentElement.querySelector(".like-count");

    button.classList.toggle("liked", likeData.liked);
    button.innerHTML = `${likeData.liked ? "❤️" : "🤍"} ${
      likeData.liked ? "Liked" : "Like"
    }`;

    if (likeCount) {
      likeCount.textContent = `${likeData.count} like${
        likeData.count !== 1 ? "s" : ""
      }`;
    }
  }
}

// Contact Form Handler
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

    // Basic validation
    if (!name || !email || !message) {
      this.showMessage("Please fill in all fields.", "error");
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showMessage("Please enter a valid email address.", "error");
      return;
    }

    // Create mailto link (since this is a static site)
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    const mailtoLink = `mailto:dantrotman92@gmail.com?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;

    this.showMessage("Opening your email client...", "success");
    this.form.reset();
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showMessage(text, type) {
    // Remove existing message
    const existingMessage = document.querySelector(".form-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const message = document.createElement("div");
    message.className = `form-message ${type}`;
    message.textContent = text;
    message.style.cssText = `
      padding: 1rem;
      margin-top: 1rem;
      border-radius: 4px;
      font-weight: 700;
      background-color: ${
        type === "error" ? "var(--warning-color)" : "var(--success-color)"
      };
      color: white;
    `;

    this.form.appendChild(message);

    // Remove message after 5 seconds
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
    anchor.addEventListener("click", function (e) {
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

// Add fade-in animation to elements
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
    }
  );

  document
    .querySelectorAll("main > *, .article-list li, .project-list li")
    .forEach((el) => {
      observer.observe(el);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
  new NavigationManager();
  new LikeManager();
  new ContactFormManager();
  initSmoothScroll();
  initFadeInAnimations();
});

// Add some console easter egg for developers
console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║    $ welcome to dannybimma's blog                                          ║
║    > built with vanilla html, css, and javascript                         ║
║    > terminal-inspired design for developers                              ║
║    > check out the source code and let's connect!                         ║
║                                                                            ║
║    GitHub: https://github.com/dannyBimma/                                 ║
║    Threads: https://www.threads.com/@danny_bimma                          ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
