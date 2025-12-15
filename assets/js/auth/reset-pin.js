/* =========================================================
   PAY54 v7.1 — Reset PIN Logic
   Behaviour matches v6.7 exactly
   ========================================================= */

import {
  getUser,
  setUser,
  clearSession,
  clearOtp
} from "../core/state.js";

/* -------------------------
   Utilities
-------------------------- */
function $(id) {
  return document.getElementById(id);
}

function showError(message) {
  alert(message); // v6.7 behaviour
}

/* -------------------------
   Reset PIN Logic
-------------------------- */
const resetForm = $("resetPinForm");

if (resetForm) {
  resetForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const identifier = $("resetId")?.value.trim();
    const newPin = $("resetNewPin")?.value.trim();
    const confirmPin = $("resetConfirmPin")?.value.trim();

    const user = getUser();

    if (!user) {
      showError("No account found.");
      window.location.replace("index.html");
      return;
    }

    if (
      identifier !== user.email &&
      identifier !== user.phone
    ) {
      showError("Email or phone not recognised.");
      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      showError("PIN must be exactly 4 digits.");
      return;
    }

    if (newPin !== confirmPin) {
      showError("PINs do not match.");
      return;
    }

    // Update PIN
    setUser({
      ...user,
      pin: newPin
    });

    // Clear any active session or OTP
    clearSession?.();
    clearOtp?.();

    alert("PIN updated successfully. Please sign in.");

    // Back to login
    window.location.replace("index.html");
  });
}

