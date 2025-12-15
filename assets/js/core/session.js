/* =========================================================
   PAY54 v7.1 — Session Guard & Role Locking
   Enforces auth rules across HTML pages
   ========================================================= */

import { getUser, getSession, clearAllState } from "./state.js";

/* -------------------------
   Page definitions
-------------------------- */
const PUBLIC_PAGES = [
  "index.html",
  "signup.html",
  "reset-pin.html",
  "otp.html"
];

const PROTECTED_PAGES = [
  "dashboard.html"
];

/* -------------------------
   Helpers
-------------------------- */
function currentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf("/") + 1);
}

function redirect(to) {
  window.location.replace(to);
}

/* -------------------------
   Core guard logic
-------------------------- */
export function enforceSession() {
  const page = currentPage();
  const user = getUser();
  const session = getSession();

  const isPublic = PUBLIC_PAGES.includes(page);
  const isProtected = PROTECTED_PAGES.includes(page);

  // 🔒 Not logged in → block dashboard
  if (isProtected && (!user || !session?.loggedIn)) {
    clearAllState();
    redirect("index.html");
    return;
  }

  // 🔁 Logged in → block auth pages
  if (isPublic && user && session?.loggedIn) {
    redirect("dashboard.html");
    return;
  }
}

/* -------------------------
   Logout helper
-------------------------- */
export function logout() {
  clearAllState();
  redirect("index.html");
}

/* -------------------------
   Auto-run on load
-------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  enforceSession();
});

