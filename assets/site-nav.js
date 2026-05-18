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
})();
