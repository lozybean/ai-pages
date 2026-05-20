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
    const media = window.matchMedia("(max-width: 680px)");
    let enabled = false;
    let lastScrollY = window.scrollY;
    let lastScrollAt = performance.now();
    let lastTouchY = null;
    let lastTouchAt = 0;
    let hideTimer = 0;

    const reveal = () => {
      if (!enabled) {
        return;
      }
      navElement.classList.add("ai-site-nav--mobile-visible");
      navElement.classList.remove("ai-site-nav--mobile-hidden");
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(hide, 1800);
    };

    const hide = () => {
      if (!enabled || window.scrollY < 4) {
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
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      const elapsed = Math.max(now - lastScrollAt, 16);
      const speed = Math.abs(delta) / elapsed;

      if (currentY < 4) {
        reveal();
      } else if (delta < -14 && speed > 0.35) {
        reveal();
      } else if (delta > 5) {
        hide();
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
        hide();
      }

      lastTouchY = currentTouchY;
      lastTouchAt = now;
    };

    const setEnabled = () => {
      enabled = media.matches;
      window.clearTimeout(hideTimer);
      navElement.classList.toggle("ai-site-nav--mobile-hidden", enabled && window.scrollY >= 4);
      navElement.classList.toggle("ai-site-nav--mobile-visible", enabled && window.scrollY < 4);
      if (!enabled) {
        navElement.classList.remove("ai-site-nav--mobile-hidden", "ai-site-nav--mobile-visible");
      }
      lastScrollY = window.scrollY;
      lastScrollAt = performance.now();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    if (media.addEventListener) {
      media.addEventListener("change", setEnabled);
    } else if (media.addListener) {
      media.addListener(setEnabled);
    }
    setEnabled();
  }
})();
