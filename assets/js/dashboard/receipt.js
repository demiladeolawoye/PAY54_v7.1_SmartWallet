(function () {
  function openReceipt(tx) {
    const modal = document.getElementById("receiptModal");
    if (!modal) return;

    document.getElementById("rType").innerText = tx.type.toUpperCase();
    document.getElementById("rAmount").innerText =
      `${symbol(tx.currency)}${tx.amount.toFixed(2)}`;
    document.getElementById("rNote").innerText = tx.note;
    document.getElementById("rDate").innerText =
      new Date(tx.date).toLocaleString();

    const msg =
      `PAY54 Receipt%0A` +
      `Type: ${tx.type}%0A` +
      `Amount: ${symbol(tx.currency)}${tx.amount.toFixed(2)}%0A` +
      `Note: ${tx.note}%0A` +
      `Date: ${new Date(tx.date).toLocaleString()}`;

    document.getElementById("waShare").href =
      `https://wa.me/?text=${msg}`;

    modal.style.display = "flex";
  }

  function closeReceipt() {
    document.getElementById("receiptModal").style.display = "none";
  }

  function symbol(c) {
    return { NGN: "₦", USD: "$", GBP: "£", EUR: "€" }[c];
  }

  // expose globally
  window.P54Receipt = { openReceipt, closeReceipt };
})();
