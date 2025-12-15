/* =========================================================
   PAY54 v7.1 — Auth Logic (Login + Signup)
   UI preserved exactly as v6.7
   ========================================================= */

import {
  getUser,
  setUser,
  setSession,
  clearAllState
} from "../core/state.js";

/* -------------------------
   Utilities
-------------------------- */
function $(id) {
  return document.getElementById(id);
}

function showError(message) {
  alert(message); // v6.7 behaviour (simple + predictable)
}

/* -------------------------
   SIGN UP LOGIC
-------------------------- */
const signupForm = $("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = $("signupName")?.value.trim();
    const email = $("signupEmail")?.value.trim();
    const phone = $("signupPhone")?.value.trim();
    const pin = $("signupPin")?.value.trim();
    const confirmPin = $("signupPinConfirm")?.value.trim();

    if (!name || !email || !phone || !pin || !confirmPin) {
      showError("All fields are required.");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      showError("PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      showError("PINs do not match.");
      return;
    }

    // Reset any existing state (clean signup)
    clearAllState();

    // Save user
    setUser({
      name,
      email,
      phone,
      pin
    });

    // OTP required after signup
    localStorage.removeItem("pay54_otp_verified");

    // Go to OTP screen
    window.location.replace("otp.html");
  });
}

/* -------------------------
   LOGIN LOGIC
-------------------------- */
const loginForm = $("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const identifier = $("loginId")?.value.trim();
    const pin = $("loginPin")?.value.trim();

    const user = getUser();

    if (!user) {
      showError("No account found. Please create an account.");
      return;
    }

    if (
      identifier !== user.email &&
      identifier !== user.phone
    ) {
      showError("Email or phone not recognised.");
      return;
    }

    if (pin !== user.pin) {
      showError("Incorrect PIN.");
      return;
    }

    // Successful login
    setSession();
    window.location.replace("dashboard.html");
  });
}

