// reset-pin.js – update stored PIN (demo)

(function () {
  const form = document.getElementById("resetPinForm");
  if (!form) return;

  const STORAGE_KEY = "pay54_demo_user";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("resetId").value.trim();
    const newPin = document.getElementById("resetNewPin").value.trim();
    const confirmPin = document
      .getElementById("resetConfirmPin")
      .value.trim();

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      alert("PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      alert("PIN and confirmation do not match.");
      return;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      alert("No PAY54 profile found for this browser.");
      return;
    }

    let user;
    try {
      user = JSON.parse(raw);
    } catch {
      alert("Corrupted demo profile. Please sign up again.");
      return;
    }

    if (id !== user.email && id !== user.phone) {
      alert("Details do not match our demo record.");
      return;
    }

    user.pin = newPin;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    alert("PIN updated for this demo profile. Please sign in again.");
    window.location.href = "index.html";
  });
})();

