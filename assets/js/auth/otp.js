/* =========================================================
   PAY54 v7.1 — OTP Logic (Mocked, v6.7 style)
   OTP code: 123456
   ========================================================= */

import {
  getUser,
  setSession,
  setOtpVerified
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
   OTP Logic
-------------------------- */
const otpForm = $("otpForm");

if (otpForm) {
  otpForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const user = getUser();
    if (!user) {
      showError("No signup session found.");
      window.location.replace("index.html");
      return;
    }

    // Collect OTP input (supports single or multiple input fields)
    let enteredOtp = "";

    const otpInputs = document.querySelectorAll(
      "input[data-otp], .otp-input, .otp-box"
    );

    if (otpInputs.length > 0) {
      otpInputs.forEach((input) => {
        enteredOtp += input.value.trim();
      });
    } else {
      // Fallback single input

