// otp.js — demo OTP (123456)

(function () {
  const form = document.getElementById("otpForm");
  if (!form) return;

  const inputs = form.querySelectorAll("input");

  inputs.forEach((input, i) => {
    input.addEventListener("input", () => {
      if (input.value && inputs[i + 1]) inputs[i + 1].focus();
    });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const code = [...inputs].map(i => i.value).join("");

    if (code === "123456") {
      localStorage.setItem("pay54_verified", "1");
      alert("OTP verified. Please sign in.");
      window.location.href = "login.html";
    } else {
      alert("Incorrect OTP. Use 123456.");
    }
  });
})();
