//Dark/light mode check
class ThemeManager {
  constructor() {
    this.init();
  }

  init() {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = globalThis.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(systemPrefersDark ? "dark" : "light");
    }

    // Listen for changes
    globalThis
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

  // Ephemeral, local, meaningless likes
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
        this.likes[articleId].count - 1,
      );
      this.likes[articleId].liked = false;
    } else {
      this.likes[articleId].count += 69;
      this.likes[articleId].liked = true;
    }

    this.saveLikes();
    this.updateAllLikeButtons(articleId);
  }

  updateAllLikeButtons(articleId) {
    const buttons = document.querySelectorAll(
      `[data-article-id="${articleId}"]`,
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
      background-color: ${
        type === "error" ? "var(--warning-color)" : "var(--success-color)"
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
║    > i am the man who will one day become King of the Pirates              ║
║    > i think ai should be used in code/math/science but banned from art    ║
║    > if you are reading this, you are a nerd; so hit me up 😁✌🏾             ║
║                                                                            ║
║    GitHub: https://github.com/dannyBimma/                                  ║
║    Threads: https://www.threads.com/@danny_bimma                           ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
