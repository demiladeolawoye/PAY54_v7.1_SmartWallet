/* =========================================================
   PAY54 v7.1 — Receipt Engine (Data-only)
   ========================================================= */

const RECEIPT_KEY = "pay54_last_receipt";

/* -------------------------
   Helpers
-------------------------- */
function uid() {
  return `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/* -------------------------
   Create receipt
-------------------------- */
export function createReceipt({
  type,
  amount,
  currency,
  label,
  meta = {}
}) {
  const receipt = {
    id: uid(),
    type,
    amount,
    currency,
    label,
    meta,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt));
  return receipt;
}

/* -------------------------
   Get last receipt
-------------------------- */
export function getLastReceipt() {
  try {
    return JSON.parse(localStorage.getItem(RECEIPT_KEY));
  } catch {
    return null;
  }
}

/* -------------------------
   Clear receipt
-------------------------- */
export function clearReceipt() {
  localStorage.removeItem(RECEIPT_KEY);
}
