(function () {
  // Mock FX table (base → target)
  const FX_RATES = {
    NGN: { USD: 0.00067, GBP: 0.00053, EUR: 0.00062 },
    USD: { NGN: 1500, GBP: 0.79, EUR: 0.92 },
    GBP: { NGN: 1900, USD: 1.26, EUR: 1.17 },
    EUR: { NGN: 1650, USD: 1.09, GBP: 0.86 }
  };

  const FX_FEE_RATE = 0.015; // 1.5% fee (mock)

  function calculate(sendAmount, from, to) {
    if (from === to) {
      return {
        receive: sendAmount,
        rate: 1,
        fee: 0
      };
    }

    const rate = FX_RATES[from][to];
    const fee = sendAmount * FX_FEE_RATE;
    const net = sendAmount - fee;
    const receive = net * rate;

    return {
      rate,
      fee,
      receive
    };
  }

  function updateFX() {
    const sendAmt = Number(document.getElementById("fxSend").value || 0);
    const from = document.getElementById("fxFrom").value;
    const to = document.getElementById("fxTo").value;

    const result = calculate(sendAmt, from, to);

    document.getElementById("fxRate").innerText = `Rate: 1 ${from} = ${result.rate} ${to}`;
    document.getElementById("fxFee").innerText = `Fee: ${from} ${result.fee.toFixed(2)}`;
    document.getElementById("fxReceive").innerText =
      `${to} ${result.receive.toFixed(2)}`;
  }

  function confirmFX() {
    const sendAmt = Number(document.getElementById("fxSend").value || 0);
    const from = document.getElementById("fxFrom").value;
    const to = document.getElementById("fxTo").value;

    if (sendAmt <= 0) {
      alert("Enter amount");
      return;
    }

    P54Pin.openPin(() => {
      P54Wallet.send(sendAmt);

      if (window.P54Receipt) {
        P54Receipt.openReceipt({
          type: "fx",
          amount: sendAmt,
          currency: from,
          note: `FX transfer ${from} → ${to}`,
          date: new Date().toISOString()
        });
      }
    });
  }

  window.P54FX = {
    updateFX,
    confirmFX
  };
})();
