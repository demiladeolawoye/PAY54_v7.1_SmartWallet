/* =========================================================
   PAY54 v7.1 — Dashboard Session Bridge
   Enforces authenticated access to v7.0 dashboard
   ========================================================= */

import { getUser, getSession, clearAllState } from "../core/state.js";

/* -------------------------
   Helpers
-------------------------- */
function redirect(to) {
  window.location.replace(to);
}

/* -------------------------
   Guard dashboard access
-------------------------- */
(function enforceDashboardSession() {
  const user = getUser();
  const session = getSession();

  if (!user || !session || session.loggedIn !== true) {
    clearAllState();
    redirect("index.html");
  }
})();

/* -------------------------
   Optional logout hook
   (binds to any element with data-logout)
-------------------------- */
document.addEventListener("click", (e) => {
  const logoutEl = e.target.closest("[data-logout]");
  if (!logoutEl) return;

  e.preventDefault();
  clearAllState();
  redirect("index.html");
});
