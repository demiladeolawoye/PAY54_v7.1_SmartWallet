// session.js — single session guard (FINAL)
(function () {
  const SESSION_KEY = "pay54_session_active";
  const active = () => localStorage.getItem(SESSION_KEY) === "1";
  const path = location.pathname;

  // Protect dashboard
  if (path.endsWith("dashboard.html") && !active()) {
    location.replace("login.html");
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      location.href = "login.html";
    });
  }
})();
