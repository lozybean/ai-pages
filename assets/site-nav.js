(() => {
  const currentScript = document.currentScript;
  const siteRoot = currentScript ? new URL("../", currentScript.src) : new URL("/", window.location.href);
  const currentPath = trimSlash(window.location.pathname);

  const links = [
    { label: "首页", path: "" },
    { label: "物流运筹", path: "topics/logistics-or/" },
    { label: "思考专题", path: "topics/think/" }
  ];

  const nav = document.createElement("nav");
  nav.className = "ai-site-nav";
  nav.setAttribute("aria-label", "主导航");
  nav.innerHTML = `
    <div class="ai-site-nav__inner">
      <a class="ai-site-nav__brand" href="${urlFor("")}" aria-label="AI Pages 首页">
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
    if (path === "") {
      return currentPath === trimSlash(siteRoot.pathname);
    }
    return currentPath.startsWith(target + "/");
  }

  function trimSlash(path) {
    return path.replace(/\/index\.html$/, "/").replace(/\/+$/, "");
  }

  function setupMobileReveal(navElement) {
    const media = window.matchMedia ? window.matchMedia("(max-width: 680px)") : null;
    let enabled = false;
    let lastScrollY = getScrollY();
    let lastScrollAt = performance.now();
    let lastTouchY = null;
    let lastTouchAt = 0;
    let hideTimer = 0;

    const reveal = () => {
      if (!enabled) {
        return;
      }
      if (getScrollY() < 80) {
        hide(true);
        return;
      }
      navElement.classList.add("ai-site-nav--mobile-visible");
      navElement.classList.remove("ai-site-nav--mobile-hidden");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 1800);
    };

    const hide = (force = false) => {
      if (!enabled || (!force && getScrollY() < 4)) {
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

      if (currentY < 4) {
        hide(true);
      } else if (delta < -14 && speed > 0.35) {
        reveal();
      } else if (delta > 5) {
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
      } else if (delta < -8) {
        hide(true);
      }

      lastTouchY = currentTouchY;
      lastTouchAt = now;
    };

    const setEnabled = () => {
      enabled = isMobileViewport();
      window.clearTimeout(hideTimer);
      navElement.classList.toggle("ai-site-nav--mobile-ready", enabled);
      navElement.classList.toggle("ai-site-nav--mobile-hidden", enabled);
      navElement.classList.remove("ai-site-nav--mobile-visible");
      if (!enabled) {
        navElement.classList.remove("ai-site-nav--mobile-hidden", "ai-site-nav--mobile-visible", "ai-site-nav--mobile-ready");
      }
      lastScrollY = getScrollY();
      lastScrollAt = performance.now();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", setEnabled, { passive: true });
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
})();
