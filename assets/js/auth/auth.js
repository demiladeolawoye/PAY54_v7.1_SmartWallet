// auth.js — PAY54 unified auth (v7.1 fixed)
(function () {
  const USER_KEY = "pay54_demo_user";
  const SESSION_KEY = "pay54_session_active";
  const VERIFIED_KEY = "pay54_verified";

  const $ = (id) => document.getElementById(id);

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  }

  function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function setSession() {
    localStorage.setItem(SESSION_KEY, "1");
  }

  // 👁 Eye toggle (works everywhere)
  document.querySelectorAll(".eye-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $(btn.dataset.target);
      if (input) input.type = input.type === "password" ? "text" : "password";
    });
  });

  // 🆕 SIGNUP
  const signupForm = $("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("signupName").value.trim();
      const email = $("signupEmail").value.trim();
      const phone = $("signupPhone").value.trim();
      const pin = $("signupPin").value.trim();
      const pin2 = $("signupPinConfirm").value.trim();

      if (!name || !email || !phone) {
        alert("Complete all fields.");
        return;
      }
      if (!/^\d{4}$/.test(pin) || pin !== pin2) {
        alert("PIN must be 4 digits and match.");
        return;
      }

      saveUser({ name, email, phone, pin });
      localStorage.removeItem(VERIFIED_KEY);

      alert("Account created. Proceed to OTP.");
      window.location.href = "verify.html";
    });
  }

  // 🔑 LOGIN
  const loginForm = $("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const id = $("loginId").value.trim();
      const pin = $("loginPin").value.trim();
      const user = getUser();

      if (!user) {
        alert("No account found. Create one first.");
        window.location.href = "signup.html";
        return;
      }

      if ((id !== user.email && id !== user.phone) || pin !== user.pin) {
        alert("Incorrect login details.");
        return;
      }

      if (localStorage.getItem(VERIFIED_KEY) !== "1") {
        alert("Complete OTP verification.");
        window.location.href = "verify.html";
        return;
      }

      setSession();
      window.location.href = "dashboard.html";
    });
  }
})();
