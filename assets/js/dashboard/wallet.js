(function () {
  const WALLET_KEY = "p54_wallet";
  const DEFAULT_WALLET = {
    currency: "NGN",
    balances: {
      NGN: 52000,
      USD: 120,
      GBP: 80,
      EUR: 95
    },
    transactions: []
  };

  // Load wallet from localStorage or use defaults
  function loadWallet() {
    return JSON.parse(localStorage.getItem(WALLET_KEY)) || DEFAULT_WALLET;
  }

  // Save wallet back to localStorage
  function saveWallet(wallet) {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  }

  // Get currency symbol for display
  function getSymbol(c) {
    return { NGN: "₦", USD: "$", GBP: "£", EUR: "€" }[c];
  }

  // Render wallet to the page
  function render() {
    const wallet = loadWallet();
    const balanceEl = document.getElementById("walletBalance");
    const txEl = document.getElementById("txList");

    if (balanceEl) {
      balanceEl.innerText =
        getSymbol(wallet.currency) + wallet.balances[wallet.currency].toFixed(2);
    }

    if (txEl) {
      txEl.innerHTML = "";
      wallet.transactions.slice(0, 5).forEach(tx => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${tx.note}</span>
          <strong>${getSymbol(tx.currency)}${tx.amount.toFixed(2)}</strong>
        `;
        txEl.appendChild(li);
      });
    }
  }

  // Adjust the balance, either adding or subtracting money
  function adjust(amount, type, note) {
    const wallet = loadWallet();
    wallet.balances[wallet.currency] += amount;
    wallet.transactions.unshift({
      type,
      amount,
      currency: wallet.currency,
      note,
      date: new Date().toISOString()
    });
    saveWallet(wallet);
    render();

    // Trigger receipt modal
    if (window.P54Receipt) {
      P54Receipt.openReceipt({
        type,
        amount,
        currency: wallet.currency,
        note,
        date: new Date().toISOString()
      });
    }
  }

  // Set the wallet's currency and re-render
  function setCurrency(currency) {
    const wallet = loadWallet();
    wallet.currency = currency;
    saveWallet(wallet);
    render();
  }

  // Handle sending money
  function send(amount) {
    P54Pin.openPin(() => adjust(-amount, "debit", "Send money"));
  }

  // Handle adding money
  function add(amount) {
    adjust(amount, "credit", "Wallet top-up");
  }

  // Handle withdrawing money
  function withdraw(amount) {
    P54Pin.openPin(() => adjust(-amount, "debit", "Withdraw"));
  }

  // Expose methods globally
  window.P54Wallet = {
    render,
    setCurrency,
    add,
    send,
    withdraw
  };

  // Initialize on page load
  document.addEventListener("DOMContentLoaded", render);
})();

