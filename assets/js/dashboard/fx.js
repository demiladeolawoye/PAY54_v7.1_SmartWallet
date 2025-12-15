/* =========================================================
   PAY54 v7.1 — FX Dashboard Wiring
   Preserves v7.0 UI
   ========================================================= */

import {
  getFxState,
  setFxState,
  quoteFx
} from "../core/fx-engine.js";

/* -------------------------
   DOM helpers (safe)
-------------------------- */
function $(selector) {
  return document.querySelector(selector);
}

/* -------------------------
   Render FX quote
-------------------------- */
function renderFx(state) {
  const sendInput = $("[data-fx-send-amount]");
  const recvOutput = $("[data-fx-receive-amount]");
  const rateEl = $("[data-fx-rate]");
  const feeEl = $("[data-fx-fee]");

  if (!sendInput || !recvOutput) return;

  const { rate, fee, receiveAmount } = quoteFx(
    Number(state.sendAmount),
    state.sendCurrency,
    state.receiveCurrency,
    state.feePct
  );

  recvOutput.textContent = receiveAmount.toLocaleString();
  if (rateEl) rateEl.textContent = rate.toFixed(4);
  if (feeEl) feeEl.textContent = fee.toFixed(2);
}

/* -------------------------
   Bind inputs
-------------------------- */
function bindFxControls(state) {
  const sendInput = $("[data-fx-send-amount]");
  const sendCur = $("[data-fx-send-currency]");
  const recvCur = $("[data-fx-receive-currency]");

  if (sendInput) {
    sendInput.addEventListener("input", (e) => {
      state.sendAmount = Number(e.target.value || 0);
      setFxState(state);
      renderFx(state);
    });
  }

  if (sendCur) {
    sendCur.addEventListener("change", (e) => {
      state.sendCurrency = e.target.value;
      setFxState(state);
      renderFx(state);
    });
  }

  if (recvCur) {
    recvCur.addEventListener("change", (e) => {
      state.receiveCurrency = e.target.value;
      setFxState(state);
      renderFx(state);
    });
  }
}

/* -------------------------
   Init
-------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const state = getFxState();
  renderFx(state);
  bindFxControls(state);
});

