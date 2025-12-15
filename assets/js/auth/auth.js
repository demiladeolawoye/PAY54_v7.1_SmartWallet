// auth.js – signup + login logic for PAY54 demo

(function () {
  const STORAGE_KEY = "pay54_demo_user";
  const SESSION_KEY = "pay54_session_active";
  const VERIFIED_KEY = "pay54_verified";

  function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function getUser() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setSessionActive() {
    localStorage.setItem(SESSION_KEY, "1");
  }

  // Expose for other scripts
  window.pay54Auth = { getUser, saveUser, setSessionActive };

  // 🔹 Eye toggles
  document.querySelectorAll(".eye-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-target");
      const input = document.getElementById(id);
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // 🔹 Signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const phone = document.getElementById("signupPhone").value.trim();
      const pin = document.getElementById("signupPin").value.trim();
      const pin2 = document.getElementById("signupPinConfirm").value.trim();

      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        alert("PIN must be 4 digits.");
        return;
      }
      if (pin !== pin2) {
        alert("PIN and confirmation do not match.");
        return;
      }

      saveUser({ name, email, phone, pin });
      localStorage.removeItem(VERIFIED_KEY);
      window.location.href = "verify.html";
    });
  }

  // 🔹 Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("loginId").value.trim();
      const pin = document.getElementById("loginPin").value.trim();
      const user = getUser();

      if (!user) {
        alert("No PAY54 profile found. Please create an account first.");
        window.location.href = "signup.html";
        return;
      }

      const idMatches = id === user.email || id === user.phone;
      const pinMatches = pin === user.pin;

      if (!idMatches || !pinMatches) {
        alert("Incorrect details. Check email/phone and PIN.");
        return;
      }

      if (localStorage.getItem(VERIFIED_KEY) !== "1") {
        alert("Please complete OTP verification first.");
        window.location.href = "verify.html";
        return;
      }

      setSessionActive();
      window.location.href = "dashboard.html";
    });
  }
})();

