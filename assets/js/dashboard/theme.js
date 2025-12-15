(function () {
  const DARK_LOGO = "assets/img/logo/pay54-logo-dark.svg";
  const LIGHT_LOGO = "assets/img/logo/pay54-logo-light.svg";

  function getPreferredTheme() {
    const saved = localStorage.getItem("p54_theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme);

    const logo = document.getElementById("pay54Logo");
    if (logo) {
      logo.src = theme === "dark" ? DARK_LOGO : LIGHT_LOGO;
    }
  }

  function toggleTheme() {
    const current = document.body.classList.contains("dark")
      ? "dark"
      : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("p54_theme", next);
    applyTheme(next);
  }

  // INIT ON LOAD
  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getPreferredTheme());
  });

  // LISTEN TO SYSTEM THEME CHANGES (only if user hasn't overridden)
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!localStorage.getItem("p54_theme")) {
        applyTheme(e.matches ? "dark" : "light");
      }
    });

  // Expose toggle globally
  window.toggleTheme = toggleTheme;
})();

