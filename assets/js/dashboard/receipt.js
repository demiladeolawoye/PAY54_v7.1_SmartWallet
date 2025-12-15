
/* =========================================================
   PAY54 v7.1 — Receipt Wiring (Dashboard)
   Preserves v7.0 UI
   ========================================================= */

import { addTransaction, getWallet } from "../core/wallet-state.js";
import { createReceipt, getLastReceipt } from "../core/receipt-engine.js";

/* -------------------------
   DOM helpers (safe)
-------------------------- */
function $(selector) {
  return document.querySelector(selector);
}

/* -------------------------
   Confirm transaction
-------------------------- */
function confirmTransaction(payload) {
  // Persist transaction
  addTransaction({
    type: payload.type,
    currency: payload.currency,
    amount: payload.amount,
    label: payload.label
  });

  // Create receipt
  createReceipt(payload);

  // Optional UI hook
  const receiptEl = $("[data-receipt-status]");
  if (receiptEl) {
    receiptEl.textContent = "Transaction successful";
  }
}

/* -------------------------
   Bind confirmation buttons
-------------------------- */
function bindConfirmActions() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-confirm-tx]");
    if (!btn) return;

    e.preventDefault();

    // Pull attributes from button (v7.0 safe pattern)
    const payload = {
      type: btn.getAttribute("data-tx-type") || "debit",
      currency: btn.getAttribute("data-tx-currency") || "NGN",
      amount: Number(btn.getAttribute("data-tx-amount") || 0),
      label: btn.getAttribute("data-tx-label") || "Wallet transaction",
      meta: {}
    };

    confirmTransaction(payload);
  });
}

/* -------------------------
   Hydrate last receipt (optional)
-------------------------- */
function hydrateReceipt() {
  const receipt = getLastReceipt();
  if (!receipt) return;

  const el = $("[data-receipt-id]");
  if (el) el.textContent = receipt.id;
}

/* -------------------------
   Init
-------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  bindConfirmActions();
  hydrateReceipt();
});
