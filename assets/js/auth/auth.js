// auth.js — PAY54 v7.1 (v6.7-compatible)

(function () {
  const USER_KEY = "pay54_demo_user";
  const SESSION_KEY = "pay54_session_active";
  const VERIFIED_KEY = "pay54_verified";

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function setSession() {
    localStorage.setItem(SESSION_KEY, "1");
  }

  // 🔐 Eye toggle
  document.querySelectorAll(".eye-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.target;
      const input = document.getElementById(id);
      if (input) {
        input.type = input.type === "password" ? "text" : "password";
      }
    });
  });

  // 🆕 SIGNUP
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", e => {
      e.preventDefault();

      const name = signupName.value.trim();
      const email = signupEmail.value.trim();
      const phone = signupPhone.value.trim();
      const pin = signupPin.value.trim();
      const pin2 = signupPinConfirm.value.trim();

      if (pin !== pin2 || !/^\d{4}$/.test(pin)) {
        alert("PIN must be 4 digits and match.");
        return;
      }

      saveUser({ name, email, phone, pin });
      localStorage.removeItem(VERIFIED_KEY);

      alert("Account created. Proceeding to OTP verification.");
      window.location.href = "verify.html";
    });
  }

  // 🔑 LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();

      const id = loginId.value.trim();
      const pin = loginPin.value.trim();
      const user = getUser();

      if (!user) {
        alert("No account found. Please create one.");
        window.location.href = "signup.html";
        return;
      }

      if ((id !== user.email && id !== user.phone) || pin !== user.pin) {
        alert("Incorrect login details.");
        return;
      }

      if (localStorage.getItem(VERIFIED_KEY) !== "1") {
        alert("Please complete OTP verification.");
        window.location.href = "verify.html";
        return;
      }

      setSession();
      alert("Login successful.");
      window.location.href = "dashboard.html";
    });
  }
})();
