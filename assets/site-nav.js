(() => {
  const currentScript = document.currentScript;
  const siteRoot = currentScript ? new URL("../", currentScript.src) : new URL("/", window.location.href);
  const currentPath = trimSlash(window.location.pathname);

  const links = [
    { label: "首页", path: "index.html" },
    { label: "物流运筹", path: "topics/logistics-or/index.html" },
    { label: "宏观经济", path: "topics/macro-economics/index.html" },
    { label: "思考专题", path: "topics/think/index.html" }
  ];

  const nav = document.createElement("nav");
  nav.className = "ai-site-nav";
  nav.setAttribute("aria-label", "主导航");
  nav.innerHTML = `
    <div class="ai-site-nav__inner">
      <a class="ai-site-nav__brand" href="${urlFor("index.html")}" aria-label="AI Pages 首页">
        <span class="ai-site-nav__mark">AI</span>
        <span>AI Pages</span>
      </a>
      <div class="ai-site-nav__links">
        ${links.map(renderLink).join("")}
      </div>
    </div>
  `;

  const oldNav = document.body.querySelector(":scope > .site-nav");
  if (oldNav) {
    oldNav.replaceWith(nav);
  } else {
    document.body.prepend(nav);
  }

  setupMobileReveal(nav);
  setupMobileArticleToc();

  function renderLink(link) {
    const href = urlFor(link.path);
    const active = isActive(link.path);
    const current = active ? ' aria-current="page"' : "";
    return `<a class="ai-site-nav__link" href="${href}"${current}>${link.label}</a>`;
  }

  function urlFor(path) {
    if (/^https?:\/\//.test(path)) {
      return path;
    }
    return new URL(path, siteRoot).href;
  }

  function isActive(path) {
    if (/^https?:\/\//.test(path)) {
      return false;
    }

    const target = trimSlash(new URL(path, siteRoot).pathname);
    if (target === currentPath) {
      return true;
    }
    if (path === "" || target === trimSlash(siteRoot.pathname)) {
      return false;
    }
    return currentPath.startsWith(target + "/");
  }

  function trimSlash(path) {
    return path.replace(/\/index\.html$/, "/").replace(/\/+$/, "");
  }

  function setupMobileReveal(navElement) {
    const media = window.matchMedia ? window.matchMedia("(max-width: 680px)") : null;
    const spacer = document.createElement("div");
    spacer.className = "ai-site-nav-spacer";
    spacer.setAttribute("aria-hidden", "true");
    let enabled = false;
    let lastScrollY = getScrollY();
    let lastScrollAt = performance.now();
    let lastTouchY = null;
    let lastTouchAt = 0;
    let hideTimer = 0;
    let revealLockedUntil = 0;

    const syncSpacer = () => {
      spacer.style.height = enabled ? `${Math.ceil(navElement.getBoundingClientRect().height)}px` : "0px";
    };

    const scheduleHide = () => {
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => hide(), 3200);
    };

    const reveal = (lockMs = 900) => {
      if (!enabled) {
        return;
      }
      navElement.classList.add("ai-site-nav--mobile-visible");
      navElement.classList.remove("ai-site-nav--mobile-hidden");
      revealLockedUntil = performance.now() + lockMs;
      syncSpacer();
      scheduleHide();
    };

    const hide = (force = false) => {
      if (!enabled || (!force && (getScrollY() < 36 || performance.now() < revealLockedUntil))) {
        return;
      }
      navElement.classList.add("ai-site-nav--mobile-hidden");
      navElement.classList.remove("ai-site-nav--mobile-visible");
    };

    const onScroll = () => {
      if (!enabled) {
        return;
      }

      const now = performance.now();
      const currentY = getScrollY();
      const delta = currentY - lastScrollY;
      const elapsed = Math.max(now - lastScrollAt, 16);
      const speed = Math.abs(delta) / elapsed;

      if (currentY < 36) {
        reveal(0);
      } else if (delta < -14 && speed > 0.35) {
        reveal();
      } else if (delta > 18 && speed > 0.18 && now >= revealLockedUntil) {
        hide(true);
      }

      lastScrollY = currentY;
      lastScrollAt = now;
    };

    const onTouchStart = (event) => {
      if (!enabled || !event.touches.length) {
        return;
      }
      lastTouchY = event.touches[0].clientY;
      lastTouchAt = performance.now();
    };

    const onTouchMove = (event) => {
      if (!enabled || lastTouchY === null || !event.touches.length) {
        return;
      }

      const now = performance.now();
      const currentTouchY = event.touches[0].clientY;
      const delta = currentTouchY - lastTouchY;
      const elapsed = Math.max(now - lastTouchAt, 16);
      const speed = Math.abs(delta) / elapsed;

      if (delta > 22 && speed > 0.45) {
        reveal();
      } else if (delta < -22 && now >= revealLockedUntil) {
        hide(true);
      }

      lastTouchY = currentTouchY;
      lastTouchAt = now;
    };

    const setEnabled = () => {
      enabled = isMobileViewport();
      window.clearTimeout(hideTimer);
      navElement.classList.toggle("ai-site-nav--mobile-ready", enabled);
      navElement.classList.toggle("ai-site-nav--mobile-visible", enabled);
      navElement.classList.remove("ai-site-nav--mobile-hidden");
      if (enabled && !spacer.isConnected) {
        navElement.after(spacer);
      }
      if (!enabled) {
        navElement.classList.remove("ai-site-nav--mobile-hidden", "ai-site-nav--mobile-visible", "ai-site-nav--mobile-ready");
        spacer.remove();
      }
      syncSpacer();
      lastScrollY = getScrollY();
      lastScrollAt = performance.now();
    };

    navElement.addEventListener("pointerenter", () => window.clearTimeout(hideTimer));
    navElement.addEventListener("pointerleave", scheduleHide);
    navElement.addEventListener("focusin", () => window.clearTimeout(hideTimer));
    navElement.addEventListener("focusout", scheduleHide);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", setEnabled, { passive: true });
    window.addEventListener("resize", syncSpacer, { passive: true });
    window.addEventListener("orientationchange", setEnabled, { passive: true });
    if (media && media.addEventListener) {
      media.addEventListener("change", setEnabled);
    } else if (media && media.addListener) {
      media.addListener(setEnabled);
    }
    setEnabled();
  }

  function getScrollY() {
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  function isMobileViewport() {
    const viewportWidth = Math.min(
      window.innerWidth || Infinity,
      document.documentElement.clientWidth || Infinity,
      window.visualViewport ? window.visualViewport.width : Infinity
    );
    const screenWidth = Math.min(window.screen ? window.screen.width : Infinity, window.screen ? window.screen.height : Infinity);
    return viewportWidth <= 680 || screenWidth <= 680;
  }

  function setupMobileArticleToc() {
    const articleToc = document.querySelector(".article-toc");
    if (!articleToc || !articleToc.querySelector("a")) {
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "article-toc-mobile-button";
    button.setAttribute("aria-controls", "article-toc-mobile-drawer");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "目录";

    const overlay = document.createElement("div");
    overlay.className = "article-toc-mobile-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const drawer = document.createElement("aside");
    drawer.id = "article-toc-mobile-drawer";
    drawer.className = "article-toc-mobile-drawer";
    drawer.setAttribute("aria-label", "文章目录");
    drawer.setAttribute("aria-hidden", "true");
    drawer.innerHTML = `
      <div class="article-toc-mobile-drawer__head">
        <strong>文章目录</strong>
        <button type="button" class="article-toc-mobile-close" aria-label="关闭目录">关闭</button>
      </div>
      <div class="article-toc-mobile-drawer__links"></div>
    `;

    const linksContainer = drawer.querySelector(".article-toc-mobile-drawer__links");
    [...articleToc.querySelectorAll("a")].forEach((link) => {
      const clone = link.cloneNode(true);
      clone.addEventListener("click", closeDrawer);
      linksContainer.appendChild(clone);
    });

    document.body.append(overlay, drawer, button);

    button.addEventListener("click", () => {
      if (document.body.classList.contains("article-toc-mobile-open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
    overlay.addEventListener("click", closeDrawer);
    drawer.querySelector(".article-toc-mobile-close").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    });

    function openDrawer() {
      document.body.classList.add("article-toc-mobile-open");
      button.setAttribute("aria-expanded", "true");
      drawer.setAttribute("aria-hidden", "false");
      overlay.setAttribute("aria-hidden", "false");
    }

    function closeDrawer() {
      document.body.classList.remove("article-toc-mobile-open");
      button.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
      overlay.setAttribute("aria-hidden", "true");
    }
  }
})();
