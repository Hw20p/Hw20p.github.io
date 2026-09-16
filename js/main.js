(function () {
  "use strict";

  /* Theme toggle */
  var root = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");
  var STORAGE_KEY = "portfolio-theme";

  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) applyTheme(saved);
  } catch (e) {
    /* localStorage unavailable, fall back to system preference */
  }

  themeToggle.addEventListener("click", function () {
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var current = root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore persistence failure */
    }
  });

  /* Menu bar clock */
  var clockEl = document.getElementById("menubar-clock");
  function updateClock() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    clockEl.textContent = h + ":" + m;
  }
  updateClock();
  setInterval(updateClock, 1000 * 15);

  /* Window manager */
  var desktopHint = document.getElementById("desktop-hint");
  var backdrop = document.getElementById("backdrop");
  var menubarTitle = document.getElementById("menubar-title");
  var defaultTitle = menubarTitle.textContent;
  var dockIcons = document.querySelectorAll(".dock-icon[data-window]");
  var windows = document.querySelectorAll(".window");
  var lastFocused = null;
  var activeWindow = null;

  function getWindow(name) {
    return document.getElementById("window-" + name);
  }

  function openWindow(name) {
    var win = getWindow(name);
    if (!win) return;

    windows.forEach(function (w) { w.classList.remove("active"); });
    dockIcons.forEach(function (icon) {
      icon.classList.toggle("active", icon.getAttribute("data-window") === name);
    });

    win.classList.add("active");
    desktopHint.classList.add("hidden");
    backdrop.classList.add("visible");
    menubarTitle.textContent = win.getAttribute("data-title") || defaultTitle;
    activeWindow = win;

    var closeBtn = win.querySelector("[data-close]");
    if (closeBtn) closeBtn.focus();
  }

  function closeWindow() {
    if (!activeWindow) return;
    activeWindow.classList.remove("active", "maximized");
    dockIcons.forEach(function (icon) { icon.classList.remove("active"); });
    backdrop.classList.remove("visible");
    desktopHint.classList.remove("hidden");
    menubarTitle.textContent = defaultTitle;
    if (lastFocused) lastFocused.focus();
    activeWindow = null;
  }

  dockIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      var name = icon.getAttribute("data-window");
      if (activeWindow && activeWindow.id === "window-" + name) {
        closeWindow();
      } else {
        lastFocused = icon;
        openWindow(name);
        if (name === "projects") resetProjectsView();
      }
    });
  });

  /* Project detail sub-view (inside the Projects window) */
  var projectsView = document.getElementById("projects-view");
  var projectDetails = document.querySelectorAll(".project-detail");

  function resetProjectsView() {
    projectsView.hidden = false;
    projectDetails.forEach(function (d) { d.hidden = true; });
  }

  function openProjectDetail(id) {
    var detail = document.querySelector('.project-detail[data-project-detail="' + id + '"]');
    if (!detail) return;
    projectsView.hidden = true;
    projectDetails.forEach(function (d) { d.hidden = true; });
    detail.hidden = false;
    var win = getWindow("projects");
    if (win) win.querySelector(".window-content").scrollTop = 0;
  }

  document.querySelectorAll(".project-card[data-project]").forEach(function (card) {
    card.addEventListener("click", function () {
      openProjectDetail(card.getAttribute("data-project"));
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProjectDetail(card.getAttribute("data-project"));
      }
    });
  });

  document.querySelectorAll("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", resetProjectsView);
  });

  windows.forEach(function (win) {
    win.querySelectorAll("[data-close]").forEach(function (btn) {
      btn.addEventListener("click", closeWindow);
    });
    var maximizeBtn = win.querySelector("[data-maximize]");
    if (maximizeBtn) {
      maximizeBtn.addEventListener("click", function () {
        win.classList.toggle("maximized");
      });
    }
  });

  backdrop.addEventListener("click", closeWindow);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeWindow) closeWindow();
  });
})();
