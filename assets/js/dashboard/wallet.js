/* =========================================================
   PAY54 v7.1 — Dashboard Wallet Hydration
   Preserves v7.0 UI completely
   ========================================================= */

import {
  getWallet,
  setCurrency
} from "../core/wallet-state.js";

/* -------------------------
   DOM helpers (safe)
-------------------------- */
function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

/* -------------------------
   Render functions
-------------------------- */
function renderBalance(wallet) {
  const el = $("[data-wallet-balance]");
  if (!el) return;

  const amount = wallet.balances[wallet.currency] ?? 0;
  el.textContent = `${wallet.currency} ${amount.toLocaleString()}`;
}

function renderCurrency(wallet) {
  const el = $("[data-wallet-currency]");
  if (!el) return;
  el.textContent = wallet.currency;
}

function renderTransactions(wallet) {
  const list = $("[data-tx-list]");
  if (!list) return;

  list.innerHTML = "";

  wallet.transactions.forEach(tx => {
    const row = document.createElement("div");
    row.className = "tx-row";
    row.innerHTML = `
      <span>${tx.label}</span>
      <strong>${tx.currency} ${tx.amount.toLocaleString()}</strong>
    `;
    list.appendChild(row);
  });
}

/* -------------------------
   Currency switch
-------------------------- */
function bindCurrencySwitch(wallet) {
  $all("[data-currency]").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-currency");
      const updated = setCurrency(code);
      render(updated);
    });
  });
}

/* -------------------------
   Render all
-------------------------- */
function render(wallet) {
  renderBalance(wallet);
  renderCurrency(wallet);
  renderTransactions(wallet);
}

/* -------------------------
   Init
-------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const wallet = getWallet();
  render(wallet);
  bindCurrencySwitch(wallet);
});

