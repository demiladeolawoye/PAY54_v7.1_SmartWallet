// session.js – simple front-end session protection

(function () {
  const SESSION_KEY = "pay54_session_active";

  function sessionActive() {
    return localStorage.getItem(SESSION_KEY) === "1";
  }

  const path = window.location.pathname;

  // Protect dashboard
  if (path.endsWith("dashboard.html")) {
    if (!sessionActive()) {
      window.location.href = "index.html";
    }
  }

  // Optional: redirect logged-in users away from login page
  if (path.endsWith("index.html") || path.endsWith("login.html") || path === "/") {
    if (sessionActive()) {
      // you can auto-forward them if you want:
      // window.location.href = "dashboard.html";
    }
  }

  // Logout button
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = "index.html";
    });
  }
})();

