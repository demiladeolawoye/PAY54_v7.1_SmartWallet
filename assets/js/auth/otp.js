// otp.js – simple demo OTP (123456)

(function () {
  const form = document.getElementById("otpForm");
  if (!form) return;

  const inputs = form.querySelectorAll(".otp-row input");

  // auto move focus
  inputs.forEach((input, idx) => {
    input.addEventListener("input", () => {
      if (input.value && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let code = "";
    inputs.forEach((i) => (code += i.value));
    if (code === "123456") {
      localStorage.setItem("pay54_verified", "1");
      alert("OTP verified. You can now sign in.");
      window.location.href = "index.html";
    } else {
      alert("Incorrect OTP. For this demo, use 123456.");
    }
  });
})();

