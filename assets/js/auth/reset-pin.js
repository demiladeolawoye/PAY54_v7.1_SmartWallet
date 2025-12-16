// reset-pin.js — PAY54 demo

(function () {
  const form = document.getElementById("resetPinForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const id = resetId.value.trim();
    const pin = resetNewPin.value.trim();
    const pin2 = resetConfirmPin.value.trim();

    const raw = localStorage.getItem("pay54_demo_user");
    if (!raw) {
      alert("No account found.");
      return;
    }

    const user = JSON.parse(raw);

    if (id !== user.email && id !== user.phone) {
      alert("Details do not match our records.");
      return;
    }

    if (pin !== pin2 || !/^\d{4}$/.test(pin)) {
      alert("PIN must be 4 digits and match.");
      return;
    }

    user.pin = pin;
    localStorage.setItem("pay54_demo_user", JSON.stringify(user));
    localStorage.removeItem("pay54_session_active");

    alert("PIN updated successfully. Please sign in.");
    window.location.href = "login.html";
  });
})();
