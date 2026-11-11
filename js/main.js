/*
 * Page behaviour: theme, menu, projects, project details, contact form.
 * Content lives in config.js and projects.js; this file only renders it.
 */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var projects = (window.PROJECTS || []).filter(function (p) { return p && p.show !== false; });
  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };

  var STATUS = {
    completed: "Completed",
    prototype: "Prototype",
    hackathon: "Hackathon",
    concept: "Concept"
  };

  /* ---------- Small DOM helper (text only, never raw HTML from data) ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "text") node.textContent = v;
        else if (k === "class") node.className = v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  var ICONS = {
    mail: '<path d="M3.5 6.5h17v11h-17z"/><path d="m4 7 8 6 8-6"/>',
    linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5v6M8 7.6v.1M11.5 16.5v-3.4c0-1.5 1-2.6 2.4-2.6s2.1 1 2.1 2.6v3.4M11.5 10.5v6"/>',
    github: '<path d="M9 19c-4 1.3-4-2-5.6-2.5M14.6 21v-3.2c0-1 .1-1.5-.5-2.1 2.6-.3 5.4-1.3 5.4-5.8a4.5 4.5 0 0 0-1.2-3.1 4.2 4.2 0 0 0-.1-3.1s-1-.3-3.2 1.2a11 11 0 0 0-5.8 0C7 3.4 6 3.7 6 3.7a4.2 4.2 0 0 0-.1 3.1 4.5 4.5 0 0 0-1.2 3.1c0 4.5 2.8 5.5 5.4 5.8-.6.6-.6 1.2-.5 2.1V21"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  function icon(name) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "icon");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = ICONS[name]; // fixed strings defined above
    return s;
  }

  /* ---------- Theme ---------- */
  var themeBtn = $("theme-toggle");
  function applyTheme(theme, save) {
    root.setAttribute("data-theme", theme);
    var next = theme === "dark" ? "light" : "dark";
    themeBtn.setAttribute("aria-label", "Switch to " + next + " theme");
    var bg = theme === "dark" ? "#1C1D20" : "#F2F4F1";
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute("content", bg); });
    if (save) { try { localStorage.setItem("theme", theme); } catch (e) {} }
  }
  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);
  themeBtn.addEventListener("click", function () {
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $("menu-toggle");
  var navList = $("nav-list");
  function setMenu(open) {
    navList.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(menuBtn.getAttribute("aria-expanded") !== "true"); });
  navList.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (menuBtn.getAttribute("aria-expanded") === "true" && !e.target.closest(".site-header")) setMenu(false);
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ---------- Current section in the nav ---------- */
  if ("IntersectionObserver" in window) {
    var links = {};
    navList.querySelectorAll("a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) { var s = $(id); if (s) spy.observe(s); });
  }

  /* ---------- Live status and profile photo ---------- */
  if (cfg.status) {
    $("live-status-text").textContent = cfg.status;
    $("live-status").hidden = false;
  }
  if (cfg.profilePhoto) {
    var img = $("about-photo-img");
    img.addEventListener("load", function () {
      $("about-photo").hidden = false;
      document.querySelector(".about-grid").classList.add("has-photo");
    });
    img.src = cfg.profilePhoto;
  }

  /* ---------- Projects ---------- */
  var grid = $("project-grid");
  var filtersEl = $("project-filters");
  var activeFilter = "all";
  var firstRender = true;

  function contextLine(p) {
    var year = p.year ? String(p.year) : "";
    return p.context + (year && p.context.indexOf(year) === -1 ? " · " + year : "");
  }

  function statusBadge(p) {
    return el("div", { class: "card-top" }, [
      el("span", { class: "status status-" + p.status, text: STATUS[p.status] || p.status }),
      p.statusNote ? el("span", { class: "status-note", text: p.statusNote }) : null
    ]);
  }

  function media(p, large) {
    if (p.image && p.image.src) {
      var src = p.image.src;
      return el("div", { class: "card-media" }, [
        el("div", { class: "shot-bar", "aria-hidden": "true" }, [el("i"), el("i"), el("i")]),
        el("img", {
          src: src + (large ? ".webp" : "-sm.webp"),
          srcset: src + "-sm.webp 640w, " + src + ".webp 1200w",
          sizes: large ? "(min-width: 800px) 760px, 100vw" : "(min-width: 1100px) 560px, (min-width: 700px) 50vw, 100vw",
          alt: large ? p.image.alt : "",
          width: "1200", height: "750",
          loading: large ? null : "lazy", decoding: "async"
        })
      ]);
    }
    // No screenshot yet (concepts): a drawn placeholder, clearly not a fake screenshot
    return el("div", { class: "card-media card-media-concept", "aria-hidden": "true" }, [
      el("span", { class: "concept-mark", text: "Concept" }),
      el("span", { class: "concept-sub", text: "Build not started" })
    ]);
  }

  function card(p) {
    var wide = activeFilter === "all" && p.featured;
    var links = [];
    if (p.links && p.links.live) {
      links.push(el("a", {
        class: "card-link", href: p.links.live, target: "_blank", rel: "noopener",
        "aria-label": p.title + " live demo (opens in a new tab)", text: "Live demo ↗"
      }));
    }
    if (p.links && p.links.repo) {
      links.push(el("a", {
        class: "card-link", href: p.links.repo, target: "_blank", rel: "noopener",
        "aria-label": p.title + " code on GitHub (opens in a new tab)", text: "Code ↗"
      }));
    }
    var stack = (p.stack || []).slice(0, wide ? 6 : 4);
    return el("li", { class: "reveal project-item" + (wide ? " is-wide" : "") }, [
      el("article", { class: "project-card", "aria-labelledby": "card-" + p.id }, [
        media(p, false),
        el("div", { class: "card-body" }, [
          statusBadge(p),
          el("h3", { id: "card-" + p.id }, [
            el("button", { class: "card-open", type: "button", "data-project": p.id, "aria-haspopup": "dialog" }, [
              p.title,
              el("span", { class: "visually-hidden", text: ": details" })
            ])
          ]),
          p.context ? el("p", { class: "card-context", text: contextLine(p) }) : null,
          el("p", { class: "card-summary", text: p.summary }),
          stack.length ? el("ul", { class: "chips card-stack", "aria-label": "Built with" },
            stack.map(function (s) { return el("li", { text: s }); }).concat(
              p.stack.length > stack.length ? [el("li", { text: "+" + (p.stack.length - stack.length) })] : []
            )) : null,
          el("div", { class: "card-actions" }, [
            el("span", { class: "card-more", "aria-hidden": "true", text: "View details →" })
          ].concat(links))
        ])
      ])
    ]);
  }

  function renderFilters() {
    var counts = { all: projects.length };
    projects.forEach(function (p) { counts[p.status] = (counts[p.status] || 0) + 1; });
    var keys = ["all"].concat(Object.keys(STATUS).filter(function (k) { return counts[k]; }));
    filtersEl.textContent = "";
    if (keys.length <= 2) return; // no point filtering a single status
    keys.forEach(function (k) {
      var b = el("button", { class: "filter-btn", type: "button", "data-filter": k, "aria-pressed": String(k === activeFilter) }, [
        k === "all" ? "All" : STATUS[k],
        el("span", { class: "filter-count", text: String(counts[k]) })
      ]);
      filtersEl.appendChild(b);
    });
  }

  function renderProjects() {
    grid.textContent = "";
    var list = projects.filter(function (p) { return activeFilter === "all" || p.status === activeFilter; });
    if (!list.length) {
      grid.appendChild(el("li", { class: "empty-note", text: "No projects in this group yet." }));
      return;
    }
    list.forEach(function (p) { grid.appendChild(card(p)); });
    if (firstRender) observeReveals(grid);
    else grid.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
    firstRender = false;
  }

  filtersEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-filter]");
    if (!b) return;
    activeFilter = b.getAttribute("data-filter");
    filtersEl.querySelectorAll("[data-filter]").forEach(function (x) {
      x.setAttribute("aria-pressed", String(x === b));
    });
    renderProjects();
  });

  /* ---------- Project details (native <dialog>: Esc closes it) ---------- */
  var modal = $("project-modal");
  var modalBody = $("modal-body");
  var lastFocus = null;

  function openProject(id, opener) {
    var p = projects.filter(function (x) { return x.id === id; })[0];
    if (!p || typeof modal.showModal !== "function") return;
    lastFocus = opener || document.activeElement;

    var parts = [
      statusBadge(p),
      el("h2", { id: "modal-title", text: p.title }),
      p.context ? el("p", { class: "modal-context", text: contextLine(p) }) : null,
      el("p", { class: "modal-summary", text: p.summary })
    ];
    if (p.image && p.image.src) {
      parts.push(el("figure", { class: "modal-figure" }, [
        media(p, true),
        p.image.caption ? el("figcaption", { text: p.image.caption }) : null
      ]));
    }
    if (p.highlights && p.highlights.length) {
      parts.push(el("h3", { text: "What works today" }));
      parts.push(el("ul", { class: "modal-list" }, p.highlights.map(function (h) { return el("li", { text: h }); })));
    }
    if (p.stack && p.stack.length) {
      parts.push(el("h3", { text: "Built with" }));
      parts.push(el("ul", { class: "chips" }, p.stack.map(function (s) { return el("li", { text: s }); })));
    }
    if (p.team) {
      parts.push(el("h3", { text: "Team" }));
      parts.push(el("p", { text: p.team }));
    }
    if (p.honesty) {
      parts.push(el("p", { class: "modal-honesty" }, [el("strong", { text: "Status: " }), p.honesty]));
    }
    var actions = [];
    if (p.links && p.links.live) {
      actions.push(el("a", { class: "btn btn-primary", href: p.links.live, target: "_blank", rel: "noopener" }, [
        "Open live demo", icon("external")
      ]));
    }
    if (p.links && p.links.repo) {
      actions.push(el("a", { class: "btn btn-ghost", href: p.links.repo, target: "_blank", rel: "noopener" }, [
        icon("github"), "View code"
      ]));
    }
    if (!actions.length) {
      actions.push(el("p", { class: "status-note", text: "The code is private for now. Ask me for a walkthrough." }));
    }
    parts.push(el("div", { class: "modal-actions" }, actions));

    modalBody.textContent = "";
    parts.forEach(function (n) { if (n) modalBody.appendChild(n); });
    modal.showModal();
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-inner").scrollTop = 0;
    $("modal-close").focus();
    try { history.replaceState(null, "", "#project-" + p.id); } catch (e) {}
  }

  function closeProject() { if (modal.open) modal.close(); }

  modal.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  });
  $("modal-close").addEventListener("click", closeProject);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeProject(); }); // backdrop
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-project]");
    if (b) openProject(b.getAttribute("data-project"), b);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealer = ("IntersectionObserver" in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); revealer.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;

  function observeReveals(scope) {
    scope.querySelectorAll(".reveal:not(.is-visible)").forEach(function (n) {
      if (revealer) revealer.observe(n); else n.classList.add("is-visible");
    });
  }

  /* ---------- Contact ---------- */
  var emails = (cfg.emails || []).filter(Boolean);
  var contactLinks = $("contact-links");
  function contactItem(href, label, iconName, external) {
    return el("li", null, [
      el("a", { href: href, target: external ? "_blank" : null, rel: external ? "noopener" : null }, [
        icon(iconName), el("span", { text: label })
      ])
    ]);
  }
  emails.forEach(function (m) { contactLinks.appendChild(contactItem("mailto:" + m, m, "mail")); });
  if (cfg.phone) contactLinks.appendChild(contactItem("tel:" + (cfg.phoneLink || cfg.phone.replace(/\s+/g, "")), cfg.phone, "phone"));
  if (cfg.linkedin) contactLinks.appendChild(contactItem(cfg.linkedin, "LinkedIn", "linkedin", true));
  if (cfg.github) contactLinks.appendChild(contactItem(cfg.github, "github.com/" + (cfg.handle || "SamkiDev"), "github", true));

  var form = $("contact-form");
  var statusEl = $("form-status");
  var submitBtn = $("cf-submit");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
  }

  function validate() {
    var firstBad = null;
    [["cf-name", function (v) { return v.trim().length > 0; }],
     ["cf-email", function (v) { return EMAIL_RE.test(v.trim()); }],
     ["cf-message", function (v) { return v.trim().length > 0; }]].forEach(function (r) {
      var input = $(r[0]);
      var ok = r[1](input.value);
      if (ok) input.removeAttribute("aria-invalid"); else input.setAttribute("aria-invalid", "true");
      if (!ok && !firstBad) firstBad = input;
    });
    return firstBad;
  }

  function mailtoFallback(data) {
    if (!emails.length) return false;
    var subject = "Portfolio message from " + data.name;
    var body = data.message + "\n\n" + data.name + "\n" + data.email;
    window.location.href = "mailto:" + emails[0] + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    return true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = validate();
    if (bad) {
      setStatus("Please fill in your name, a valid email and a message.", "error");
      bad.focus();
      return;
    }
    if (form.elements._gotcha.value) return; // spam trap filled: silently ignore

    var data = {
      name: $("cf-name").value.trim(),
      email: $("cf-email").value.trim(),
      message: $("cf-message").value.trim()
    };

    if (!cfg.formEndpoint) {
      if (mailtoFallback(data)) setStatus("Your email app should open with the message ready to send.", "ok");
      else setStatus("Sorry, messages can't be sent from this page yet. Please reach me on GitHub.", "error");
      return;
    }

    submitBtn.disabled = true;
    setStatus("Sending…");
    fetch(cfg.formEndpoint, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      form.reset();
      setStatus("Thanks, your message was sent. I'll reply by email.", "ok");
    }).catch(function () {
      if (mailtoFallback(data)) setStatus("The form service didn't respond, so your email app should open instead.", "error");
      else setStatus("Sorry, the message couldn't be sent. Please try again later.", "error");
    }).then(function () { submitBtn.disabled = false; });
  });

  /* ---------- Card spotlight (follows the pointer) ---------- */
  grid.addEventListener("pointermove", function (e) {
    var c = e.target.closest(".project-card");
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty("--mx", (e.clientX - r.left) + "px");
    c.style.setProperty("--my", (e.clientY - r.top) + "px");
  });

  /* ---------- Links elsewhere on the page that open a project ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-open-project]");
    if (!a) return;
    e.preventDefault();
    openProject(a.getAttribute("data-open-project"), a);
  });

  /* ---------- Stats, worked out from projects.js so they never drift ---------- */
  (function () {
    var built = projects.filter(function (p) { return p.status !== "concept"; }).length;
    var hack = projects.filter(function (p) { return p.status === "hackathon"; }).length;
    var tech = {};
    projects.forEach(function (p) { (p.stack || []).forEach(function (s) { tech[s.replace(/\s+\d+$/, "")] = 1; }); });
    var items = [
      [String(built), "projects built"],
      [String(hack), "hackathon builds"],
      ["2nd", "place, AskThuso"]
    ];
    var ul = $("stats");
    items.forEach(function (it) {
      ul.appendChild(el("li", null, [el("strong", { text: it[0] }), el("span", { text: it[1] })]));
    });

    var track = $("marquee-track");
    var names = Object.keys(tech);
    [0, 1].forEach(function () {
      var row = el("ul", { class: "marquee-row" }, names.map(function (n) { return el("li", { text: n }); }));
      track.appendChild(row);
    });
  })();

  /* ---------- Hero parallax ---------- */
  var showcase = $("hero-showcase");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (showcase && window.matchMedia("(pointer: fine)").matches) {
    var hero = showcase.closest(".hero");
    hero.addEventListener("pointermove", function (e) {
      if (still.matches) return;
      var r = hero.getBoundingClientRect();
      showcase.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      showcase.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", function () {
      showcase.style.setProperty("--px", "0");
      showcase.style.setProperty("--py", "0");
    });
  }

  /* ---------- Start ---------- */
  $("year").textContent = String(new Date().getFullYear());
  renderFilters();
  renderProjects();
  document.querySelectorAll(".section-head, .about-grid > *, .achievement, .contact-grid > *").forEach(function (n) {
    n.classList.add("reveal");
  });
  observeReveals(document);

  function openFromHash() {
    var m = /^#project-([\w-]+)$/.exec(location.hash);
    if (m && !modal.open) openProject(m[1]);
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
