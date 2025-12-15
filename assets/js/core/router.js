// assets/js/core/router.js
(function () {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";

  const user = localStorage.getItem("pay54_user");
  const session = localStorage.getItem("pay54_session");
  const otpVerified = localStorage.getItem("pay54_otp_verified");

  // --- ROUTE GUARDS ---

  // Dashboard protection
  if (page === "dashboard.html") {
    if (!user || !session) {
      window.location.replace("index.html");
    }
    return;
  }

  // OTP page protection
  if (page === "otp.html") {
    if (!user || otpVerified === "true") {
      window.location.replace("index.html");
    }
    return;
  }

  // Auth pages (login/signup)
  if (page === "index.html" || page === "signup.html") {
    if (user && session) {
      window.location.replace("dashboard.html");
    }
    return;
  }
})();

