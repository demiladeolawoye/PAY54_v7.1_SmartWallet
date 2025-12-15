/* =========================================================
   PAY54 v7.1 — Wallet State (Source of Truth)
   ========================================================= */

const WALLET_KEY = "pay54_wallet";

const DEFAULT_WALLET = {
  currency: "NGN",
  balances: {
    NGN: 250000,
    USD: 1200,
    GBP: 850,
    EUR: 900
  },
  transactions: [
    {
      id: "tx_001",
      type: "credit",
      currency: "NGN",
      amount: 150000,
      label: "Wallet funding",
      date: new Date().toISOString()
    },
    {
      id: "tx_002",
      type: "debit",
      currency: "NGN",
      amount: 25000,
      label: "Airtime top-up",
      date: new Date().toISOString()
    }
  ]
};

/* -------------------------
   Helpers
-------------------------- */
export function getWallet() {
  try {
    const w = JSON.parse(localStorage.getItem(WALLET_KEY));
    return w || initWallet();
  } catch {
    return initWallet();
  }
}

export function setWallet(wallet) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

export function initWallet() {
  setWallet(DEFAULT_WALLET);
  return DEFAULT_WALLET;
}

export function setCurrency(code) {
  const wallet = getWallet();
  wallet.currency = code;
  setWallet(wallet);
  return wallet;
}

export function addTransaction(tx) {
  const wallet = getWallet();
  wallet.transactions.unshift({
    id: `tx_${Date.now()}`,
    date: new Date().toISOString(),
    ...tx
  });
  setWallet(wallet);
  return wallet;
}
