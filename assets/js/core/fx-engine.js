/* =========================================================
   PAY54 v7.1 — FX Mock Engine
   Deterministic demo FX (no API)
   ========================================================= */

const FX_KEY = "pay54_fx_state";

/* Mock rates (base: USD) */
const FX_RATES = {
  USD: { USD: 1, NGN: 1550, GBP: 0.78, EUR: 0.92 },
  NGN: { USD: 1 / 1550, NGN: 1, GBP: 0.00050, EUR: 0.00059 },
  GBP: { USD: 1.28, NGN: 1985, GBP: 1, EUR: 1.17 },
  EUR: { USD: 1.09, NGN: 1690, GBP: 0.85, EUR: 1 }
};

const DEFAULT_FX = {
  sendCurrency: "NGN",
  receiveCurrency: "USD",
  sendAmount: 10000,
  feePct: 0.8
};

/* -------------------------
   State helpers
-------------------------- */
export function getFxState() {
  try {
    return JSON.parse(localStorage.getItem(FX_KEY)) || initFx();
  } catch {
    return initFx();
  }
}

export function setFxState(state) {
  localStorage.setItem(FX_KEY, JSON.stringify(state));
}

export function initFx() {
  setFxState(DEFAULT_FX);
  return DEFAULT_FX;
}

/* -------------------------
   Core calculation
-------------------------- */
export function quoteFx(sendAmount, sendCur, recvCur, feePct = 0.8) {
  const rate = FX_RATES[sendCur]?.[recvCur] || 0;
  const gross = sendAmount * rate;
  const fee = gross * (feePct / 100);
  const net = gross - fee;

  return {
    rate,
    fee,
    receiveAmount: Number(net.toFixed(2))
  };
}
