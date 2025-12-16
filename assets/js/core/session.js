/* session.js — PAY54 v7.0 (FULL REPLACEMENT) */

(function () {
  const protectedPages = ["dashboard.html"];
  const session = localStorage.getItem("pay54_session");

  const current = window.location.pathname.split("/").pop();

  if (protectedPages.includes(current) && session !== "active") {
    window.location.href = "index.html";
  }
})();
