/* ============================================================
   PAY54 v7.0 • Dashboard UI Engine
   - Session protection (redirect to login)
   - Currency switching: NGN | USD | GBP | EUR
   - Theme toggle (persist)
   - Profile mini modal + logout
   - Money Moves full flows + receipts
   - Services (FX amended flow + other demo flows)
   - Transactions feed + View all
   - Requests & Alerts + Clear all
   ============================================================ */

const KEYS = {
  // Support BOTH key styles from earlier builds
  USER_V67: "pay54_demo_user",
  USER_ALT: "pay54_user",
  SESSION: "pay54_session_active",
  VERIFIED: "pay54_verified",
  THEME: "pay54_theme",
  STATE: "pay54_dash_state_v70",
  TX: "pay54_tx_v70",
  ALERTS: "pay54_alerts_v70",
  PORTFOLIO: "pay54_portfolio_v70",
};

const FX = {
  // Mock FX rates (demo)
  NGN_PER_USD: 1550,
  NGN_PER_GBP: 2000,
  NGN_PER_EUR: 1700,
  // payout conversions (approx) using NGN as base
  GHS_PER_NGN: 0.0095,
  KES_PER_NGN: 0.085,
  ZAR_PER_NGN: 0.012,
};

const BANKS = {
  NG: ["Access Bank", "GTBank", "Zenith Bank", "UBA", "FirstBank", "Kuda"],
  GH: ["GCB Bank", "Ecobank Ghana", "Absa Ghana", "Fidelity Bank GH"],
  KE: ["KCB", "Equity Bank", "Co-operative Bank", "NCBA"],
  ZA: ["Standard Bank", "FNB", "ABSA", "Nedbank", "Capitec"],
};

const el = (id) => document.getElementById(id);

function safeParse(raw, fallback = null) {
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function nowStamp() {
  return new Date().toLocaleString("en-GB", { hour12: false });
}

function txId() {
  return "P54-" + Math.random().toString(16).slice(2, 10).toUpperCase();
}

function formatMoney(amount, currency) {
  const n = Number(amount || 0);
  const symbol =
    currency === "USD" ? "$" :
    currency === "GBP" ? "£" :
    currency === "EUR" ? "€" : "₦";
  // Keep NGN formatting familiar; others simple
  const locale = currency === "NGN" ? "en-NG" : "en-GB";
  return `${symbol}${n.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function showToast(message) {
  const t = el("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 2600);
}

function getUser() {
  const a = safeParse(localStorage.getItem(KEYS.USER_V67), null);
  const b = safeParse(localStorage.getItem(KEYS.USER_ALT), null);
  return a || b;
}

function sessionActive() {
  return localStorage.getItem(KEYS.SESSION) === "1";
}

function requireSessionOrRedirect() {
  if (!sessionActive()) {
    // Prefer v6.7 login entry
    window.location.href = "login.html";
  }
}

function getState() {
  return safeParse(localStorage.getItem(KEYS.STATE), null) || {
    activeCurrency: "NGN",
    balances: { NGN: 540000, USD: 1200, GBP: 850, EUR: 980 },
    accountNo: "012 345 6789",
    payTag: "@pay54demo",
    kyc: "Tier 2 · Verified (Demo)",
  };
}

function setState(state) {
  localStorage.setItem(KEYS.STATE, JSON.stringify(state));
}

function getTx() {
  const tx = safeParse(localStorage.getItem(KEYS.TX), null);
  if (tx && Array.isArray(tx)) return tx;

  // Default premium sample tx (as you requested)
  const seed = [
    { id: txId(), type: "credit", title: "Wallet top-up", detail: "Card top-up", amount: 52000, currency: "NGN", time: nowStamp() },
    { id: txId(), type: "debit", title: "MTN Airtime", detail: "Bills • Airtime", amount: 12000, currency: "NGN", time: nowStamp() },
    { id: txId(), type: "credit", title: "FX • USD", detail: "Converted to NGN", amount: 10000, currency: "NGN", time: nowStamp() },
    { id: txId(), type: "debit", title: "JumiaFood", detail: "Shop on the Fly", amount: 9200, currency: "NGN", time: nowStamp() },
  ];
  localStorage.setItem(KEYS.TX, JSON.stringify(seed));
  return seed;
}

function addTx(entry) {
  const tx = getTx();
  tx.unshift(entry);
  localStorage.setItem(KEYS.TX, JSON.stringify(tx.slice(0, 60)));
}

function getAlerts() {
  const a = safeParse(localStorage.getItem(KEYS.ALERTS), null);
  if (a && Array.isArray(a)) return a;

  const seed = [
    { id: txId(), text: "AI Risk Watch: Unusual login attempt blocked (demo).", time: nowStamp() },
    { id: txId(), text: "Welcome to PAY54 v7.0 demo — explore Money Moves & Services.", time: nowStamp() },
  ];
  localStorage.setItem(KEYS.ALERTS, JSON.stringify(seed));
  return seed;
}

function addAlert(text) {
  const a = getAlerts();
  a.unshift({ id: txId(), text, time: nowStamp() });
  localStorage.setItem(KEYS.ALERTS, JSON.stringify(a.slice(0, 50)));
}

function clearAlerts() {
  localStorage.setItem(KEYS.ALERTS, JSON.stringify([]));
}

function applyTheme(theme) {
  // Your CSS uses dark-first; we’ll just add a class for light
  // If your theme.css already handles it, it will still work.
  document.documentElement.dataset.theme = theme; // "dark" | "light"
  localStorage.setItem(KEYS.THEME, theme);
  const btn = el("modeToggle");
  if (btn) btn.textContent = theme === "dark" ? "◐ Dark" : "☀ Light";
}

function initTheme() {
  const saved = localStorage.getItem(KEYS.THEME) || "dark";
  applyTheme(saved);
  const btn = el("modeToggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const next = (localStorage.getItem(KEYS.THEME) || "dark") === "dark" ? "light" : "dark";
      applyTheme(next);
      showToast(`Theme: ${next}`);
    });
  }
}

function setActiveCurrency(currency) {
  const state = getState();
  state.activeCurrency = currency;
  setState(state);

  // Chip UI
  document.querySelectorAll("#currencyToggle .chip").forEach((b) => {
    b.classList.toggle("chip-active", b.dataset.currency === currency);
  });

  renderBalance();
  renderTx();
  showToast(`Active wallet: ${currency}`);
}

function renderUser() {
  const user = getUser();
  const state = getState();

  const name = user?.name || "PAY54 User";
  const tag = state.payTag || "@pay54demo";
  const initial = (name || "P").trim().slice(0, 1).toUpperCase();

  if (el("profileName")) el("profileName").textContent = name;
  if (el("profileTagLine")) el("profileTagLine").textContent = tag;
  if (el("profileAvatar")) el("profileAvatar").textContent = initial;

  if (el("payTag")) el("payTag").textContent = tag;
  if (el("ngnAccountNo")) el("ngnAccountNo").textContent = state.accountNo || "012 345 6789";
  if (el("kycLevel")) el("kycLevel").textContent = state.kyc || "Tier 2 · Verified (Demo)";
}

function renderBalance() {
  const state = getState();
  const cur = state.activeCurrency || "NGN";
  const amount = state.balances?.[cur] ?? 0;
  if (el("walletBalance")) el("walletBalance").textContent = formatMoney(amount, cur);
}

function renderTx() {
  const list = el("txList");
  const empty = el("txEmpty");
  const tx = getTx();
  const state = getState();
  const cur = state.activeCurrency || "NGN";

  // show all tx but highlight currency relevance
  if (!list) return;
  list.innerHTML = "";

  const top = tx.slice(0, 6);
  if (!top.length) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  top.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = `${t.title} • ${formatMoney(t.amount, t.currency)} • ${t.detail}`;
    // Simple visual cue via emojis (keeps your CSS untouched)
    li.prepend(document.createTextNode(t.type === "credit" ? "🟢 " : "🔴 "));
    // Add small currency hint if not current
    if (t.currency !== cur) {
      li.append(document.createTextNode(` (${t.currency})`));
    }
    list.appendChild(li);
  });
}

function renderAlerts() {
  const list = el("requestsList");
  const empty = el("requestsEmpty");
  const alerts = getAlerts();

  if (!list) return;
  list.innerHTML = "";

  if (!alerts.length) {
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  alerts.slice(0, 6).forEach((a) => {
    const li = document.createElement("li");
    li.textContent = `${a.text} • ${a.time}`;
    list.appendChild(li);
  });
}

function openModal(title, bodyHTML, primaryText = "Continue", onPrimary = null, footerButtons = []) {
  el("modalTitle").textContent = title;
  el("modalBody").innerHTML = bodyHTML;

  const overlay = el("modalOverlay");
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");

  const primary = el("modalPrimary");
  primary.textContent = primaryText;

  // Reset footer
  const footer = el("modalFooter");
  footer.innerHTML = "";
  footer.appendChild(primary);

  footerButtons.forEach((btn) => footer.appendChild(btn));

  const close = () => closeModal();
  el("modalClose").onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  primary.onclick = () => {
    if (typeof onPrimary === "function") onPrimary();
  };
}

function closeModal() {
  const overlay = el("modalOverlay");
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
}

function openProfile() {
  const user = getUser();
  const state = getState();
  const name = user?.name || "PAY54 User";
  const email = user?.email || "demo@pay54.app";
  const tag = state.payTag || "@pay54demo";

  el("profileBody").innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
      <div><strong>Name:</strong> ${name}</div>
      <div><strong>Email:</strong> ${email}</div>
      <div><strong>PayTag:</strong> ${tag}</div>
      <div style="opacity:.85"><strong>Note:</strong> Demo profile stored locally.</div>
    </div>
  `;

  const overlay = el("profileOverlay");
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");

  const close = () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  };

  el("profileClose").onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };

  el("profileSupport").onclick = () => {
    close();
    openModal("Support Centre", `
      <div style="font-size:13px;line-height:1.5">
        <p><strong>Support (demo)</strong></p>
        <p>Email: support@pay54.app</p>
        <p>WhatsApp: +234 000 000 0000</p>
        <p>Tip: Describe the issue and include a screenshot.</p>
      </div>
    `, "Close", () => closeModal());
  };

  el("profileLogout").onclick = () => doLogout();
  el("profileSettings").onclick = () => {
    showToast("Settings is future scope.");
  };
}

function doLogout() {
  // Clear PAY54 keys only (safe)
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  // also clear known session key
  localStorage.removeItem("pay54_session_active");
  window.location.href = "login.html";
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).then(() => showToast("Copied to clipboard"));
}

function waShare(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function receiptHTML({ title, lines, shareText }) {
  const rows = lines.map(([k, v]) => `<div style="display:flex;justify-content:space-between;gap:10px;">
      <span style="opacity:.85">${k}</span><span><strong>${v}</strong></span>
    </div>`).join("");

  return `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:13px;opacity:.9">✅ Successfully completed (demo)</div>
      <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
        ${rows}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;">
        <button class="btn-pill" id="rcptWa" type="button">Share WhatsApp</button>
        <button class="btn-pill btn-outline" id="rcptCopy" type="button">Copy receipt</button>
      </div>
    </div>
  `.trim();
}

function showReceipt({ title, lines, shareText }) {
  openModal(title, receiptHTML({ title, lines, shareText }), "Close", () => closeModal());
  setTimeout(() => {
    const copyBtn = document.getElementById("rcptCopy");
    const waBtn = document.getElementById("rcptWa");
    const full = lines.map(([k, v]) => `${k}: ${v}`).join("\n");

    if (copyBtn) copyBtn.onclick = () => copyToClipboard(`${title}\n${full}`);
    if (waBtn) waBtn.onclick = () => waShare(shareText || `${title}\n${full}`);
  }, 0);
}

/* -----------------------
   BALANCE ENGINE HELPERS
------------------------*/
function adjustBalance(currency, delta) {
  const state = getState();
  const b = state.balances || {};
  b[currency] = Number(b[currency] || 0) + Number(delta || 0);
  state.balances = b;
  setState(state);
  renderBalance();
}

function ensureSufficient(currency, amount) {
  const state = getState();
  const bal = Number(state.balances?.[currency] || 0);
  return bal >= Number(amount || 0);
}

/* -----------------------
   MODAL FLOWS (MONEY MOVES)
------------------------*/
function flowSendP2P() {
  const state = getState();
  const cur = state.activeCurrency || "NGN";

  openModal("Send PAY54 → PAY54", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Recipient Tag</label>
      <input id="p2pTo" placeholder="@username54" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Amount (${cur})</label>
      <input id="p2pAmt" type="number" min="1" placeholder="5000" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Note (optional)</label>
      <input id="p2pNote" placeholder="e.g. Lunch" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <div style="font-size:12px;opacity:.85">Fee preview: <strong>${formatMoney(0, cur)}</strong> (demo)</div>
    </div>
  `, "Send", () => {
    const to = (document.getElementById("p2pTo").value || "").trim();
    const amt = Number(document.getElementById("p2pAmt").value || 0);
    const note = (document.getElementById("p2pNote").value || "").trim();

    if (!to || amt <= 0) return showToast("Enter recipient tag and amount.");
    if (!ensureSufficient(cur, amt)) return showToast("Insufficient balance.");

    adjustBalance(cur, -amt);
    const id = txId();
    addTx({ id, type: "debit", title: "P2P Transfer", detail: `Sent to ${to}${note ? " • " + note : ""}`, amount: amt, currency: cur, time: nowStamp() });
    renderTx();

    closeModal();
    showReceipt({
      title: "Receipt • P2P Transfer",
      lines: [
        ["Sender", getUser()?.name || "PAY54 User"],
        ["Recipient", to],
        ["Amount", formatMoney(amt, cur)],
        ["Fee", formatMoney(0, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nSent ${formatMoney(amt, cur)} to ${to}\nTx: ${id}`
    });
  });
}

function flowReceive() {
  const state = getState();
  const acct = state.accountNo || "012 345 6789";
  const tag = state.payTag || "@pay54demo";

  openModal("Receive Money", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:13px;opacity:.9">Share your details to receive money.</div>
      <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
        <div><strong>Account:</strong> ${acct}</div>
        <div><strong>Tag:</strong> ${tag}</div>
        <div style="margin-top:8px;opacity:.85">QR Code (demo placeholder)</div>
        <div style="height:110px;border-radius:14px;border:1px dashed rgba(148,163,184,.35);display:flex;align-items:center;justify-content:center;margin-top:6px;">QR</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn-pill" id="rxCopy" type="button">Copy details</button>
        <button class="btn-pill btn-outline" id="rxWa" type="button">Share WhatsApp</button>
      </div>
    </div>
  `, "Close", () => closeModal());

  setTimeout(() => {
    const msg = `Hi, you can send money to me via PAY54.\nAccount: ${acct}\nTag: ${tag}\nThank you.`;
    const c = document.getElementById("rxCopy");
    const w = document.getElementById("rxWa");
    if (c) c.onclick = () => copyToClipboard(msg);
    if (w) w.onclick = () => waShare(msg);
  }, 0);
}

function flowAddMoney() {
  const state = getState();
  const cur = state.activeCurrency || "NGN";

  openModal("Add Money", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Source</label>
      <select id="addSrc" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option value="Card">Card top-up</option>
        <option value="Bank">Bank transfer</option>
        <option value="Agent">Agent cash-in</option>
      </select>
      <label>Amount (${cur})</label>
      <input id="addAmt" type="number" min="1" placeholder="20000" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <div style="font-size:12px;opacity:.85">This is a demo simulation.</div>
    </div>
  `, "Confirm", () => {
    const src = document.getElementById("addSrc").value;
    const amt = Number(document.getElementById("addAmt").value || 0);
    if (amt <= 0) return showToast("Enter a valid amount.");

    adjustBalance(cur, amt);
    const id = txId();
    addTx({ id, type: "credit", title: "Wallet top-up", detail: `Top-up via ${src}`, amount: amt, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Wallet Top-up",
      lines: [
        ["Method", src],
        ["Amount", formatMoney(amt, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nTop-up ${formatMoney(amt, cur)} via ${src}\nTx: ${id}`
    });
  });
}

function flowWithdraw() {
  const state = getState();
  const cur = state.activeCurrency || "NGN";

  openModal("Withdraw", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Destination</label>
      <select id="wdDst" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option value="Bank">Bank withdrawal</option>
        <option value="Agent">Agent withdrawal</option>
      </select>
      <label>Amount (${cur})</label>
      <input id="wdAmt" type="number" min="1" placeholder="5000" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
    </div>
  `, "Confirm", () => {
    const dst = document.getElementById("wdDst").value;
    const amt = Number(document.getElementById("wdAmt").value || 0);
    if (amt <= 0) return showToast("Enter a valid amount.");
    if (!ensureSufficient(cur, amt)) return showToast("Insufficient balance.");

    adjustBalance(cur, -amt);
    const id = txId();
    addTx({ id, type: "debit", title: "Withdrawal", detail: `Withdraw to ${dst}`, amount: amt, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Withdrawal",
      lines: [
        ["Destination", dst],
        ["Amount", formatMoney(amt, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nWithdrawal ${formatMoney(amt, cur)} to ${dst}\nTx: ${id}`
    });
  });
}

function flowBankTransfer() {
  const state = getState();
  const cur = state.activeCurrency || "NGN";

  openModal("Bank Transfer", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Bank</label>
      <select id="btBank" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        ${BANKS.NG.map(b => `<option>${b}</option>`).join("")}
      </select>
      <label>Account number</label>
      <input id="btAcct" placeholder="10 digits" inputmode="numeric" maxlength="10"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Amount (${cur})</label>
      <input id="btAmt" type="number" min="1" placeholder="10000"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Note (optional)</label>
      <input id="btNote" placeholder="e.g. Rent"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
    </div>
  `, "Send", () => {
    const bank = document.getElementById("btBank").value;
    const acct = (document.getElementById("btAcct").value || "").trim();
    const amt = Number(document.getElementById("btAmt").value || 0);
    const note = (document.getElementById("btNote").value || "").trim();

    if (!/^\d{10}$/.test(acct)) return showToast("Account number must be 10 digits.");
    if (amt <= 0) return showToast("Enter a valid amount.");
    if (!ensureSufficient(cur, amt)) return showToast("Insufficient balance.");

    adjustBalance(cur, -amt);
    const id = txId();
    addTx({ id, type: "debit", title: "Bank transfer", detail: `${bank} • ${acct}${note ? " • " + note : ""}`, amount: amt, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Bank Transfer",
      lines: [
        ["Bank", bank],
        ["Account", acct.replace(/^(\d{2})\d{6}(\d{2})$/, "$1******$2")],
        ["Amount", formatMoney(amt, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nBank transfer ${formatMoney(amt, cur)} to ${bank}\nTx: ${id}`
    });
  });
}

function flowRequestMoney() {
  const state = getState();
  const cur = state.activeCurrency || "NGN";

  openModal("Request Money", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Recipient Tag</label>
      <input id="rqTo" placeholder="@username54"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Amount (${cur})</label>
      <input id="rqAmt" type="number" min="1" placeholder="5000"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Note (optional)</label>
      <input id="rqNote" placeholder="e.g. Please pay me back"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <div style="font-size:12px;opacity:.85">This will add a notification to Requests & Alerts.</div>
    </div>
  `, "Create request", () => {
    const to = (document.getElementById("rqTo").value || "").trim();
    const amt = Number(document.getElementById("rqAmt").value || 0);
    const note = (document.getElementById("rqNote").value || "").trim();
    if (!to || amt <= 0) return showToast("Enter recipient tag and amount.");

    addAlert(`You requested ${formatMoney(amt, cur)} from ${to}${note ? " • " + note : ""}`);
    renderAlerts();
    closeModal();

    const msg = `PAY54 request (demo)\nPlease send ${formatMoney(amt, cur)} to me.\nRecipient: ${getState().payTag}\nRequested from: ${to}`;
    showReceipt({
      title: "Receipt • Money Request",
      lines: [
        ["Requested from", to],
        ["Amount", formatMoney(amt, cur)],
        ["Note", note || "—"],
        ["Time", nowStamp()],
        ["Transaction ID", txId()],
      ],
      shareText: msg
    });
  }, [
    (() => {
      const b = document.createElement("button");
      b.className = "btn-pill btn-outline";
      b.textContent = "WhatsApp";
      b.type = "button";
      b.onclick = () => {
        const to = (document.getElementById("rqTo").value || "").trim() || "@friend";
        const amt = Number(document.getElementById("rqAmt").value || 0) || 0;
        waShare(`Hi ${to}, please send me ${formatMoney(amt, cur)} via PAY54. Thanks!`);
      };
      return b;
    })()
  ]);
}

/* -----------------------
   SERVICES FLOWS
------------------------*/
function flowCrossBorderFX() {
  // ✅ AMENDED FLOW
  // You are sending: amount + currency (USD/GBP/EUR)
  // Select payout country (NG/GH/KE/ZA) BEFORE conversion shows
  // Receiver bank (dropdown by country), receiver name, receiver acct, fees, receipt & tx
  const state = getState();

  openModal("Cross-border FX", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:12px;opacity:.9">Send FX (USD/GBP/EUR) and pay out locally in Africa (demo).</div>

      <label>You are sending</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input id="fxAmt" type="number" min="1" placeholder="100"
          style="flex:1;padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <select id="fxCur"
          style="width:120px;padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
          <option value="USD">USD</option>
          <option value="GBP">GBP</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      <label>Payout country (select first)</label>
      <select id="fxCountry"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option value="">— Select —</option>
        <option value="NG">NG (Nigeria)</option>
        <option value="GH">GH (Ghana)</option>
        <option value="KE">KE (Kenya)</option>
        <option value="ZA">ZA (South Africa)</option>
      </select>

      <div style="padding:10px;border-radius:14px;border:1px solid rgba(148,163,184,.25);">
        <div style="display:flex;justify-content:space-between;"><span style="opacity:.85">They receive</span><strong id="fxReceive">—</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;"><span style="opacity:.85">Fee</span><strong id="fxFee">—</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;"><span style="opacity:.85">Rate</span><strong id="fxRate">—</strong></div>
      </div>

      <label>Receiver bank</label>
      <select id="fxBank" disabled
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option>— Select payout country first —</option>
      </select>

      <label>Receiver name</label>
      <input id="fxName" placeholder="e.g. Ade Olawoye"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">

      <label>Receiver account number</label>
      <input id="fxAcct" placeholder="e.g. 0123456789"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">

      <div style="font-size:12px;opacity:.85">Converted amount shows only after payout country selection.</div>
    </div>
  `, "Send FX", () => {
    const amt = Number(document.getElementById("fxAmt").value || 0);
    const cur = document.getElementById("fxCur").value;
    const country = document.getElementById("fxCountry").value;
    const bank = document.getElementById("fxBank").value;
    const name = (document.getElementById("fxName").value || "").trim();
    const acct = (document.getElementById("fxAcct").value || "").trim();

    if (amt <= 0) return showToast("Enter a valid amount.");
    if (!country) return showToast("Select payout country first.");
    if (!name || !acct) return showToast("Enter receiver name and account number.");
    if (!bank || bank.includes("Select payout country")) return showToast("Select a receiver bank.");

    // Balance impact in FX wallet currency (sender)
    const s = getState();
    const senderBal = Number(s.balances?.[cur] || 0);
    if (senderBal < amt) return showToast(`Insufficient ${cur} balance.`);

    // Compute receive amount based on currency->NGN->payout
    const ngn = cur === "USD" ? amt * FX.NGN_PER_USD : cur === "GBP" ? amt * FX.NGN_PER_GBP : amt * FX.NGN_PER_EUR;
    const fee = Math.max(1, amt * 0.01); // 1% fee demo (in sender currency)
    const netAmt = Math.max(0, amt - fee);

    const netNgn = cur === "USD" ? netAmt * FX.NGN_PER_USD : cur === "GBP" ? netAmt * FX.NGN_PER_GBP : netAmt * FX.NGN_PER_EUR;

    let receiveStr = "";
    if (country === "NG") receiveStr = formatMoney(netNgn, "NGN");
    if (country === "GH") receiveStr = `GH₵${(netNgn * FX.GHS_PER_NGN).toFixed(2)}`;
    if (country === "KE") receiveStr = `KSh${(netNgn * FX.KES_PER_NGN).toFixed(2)}`;
    if (country === "ZA") receiveStr = `R${(netNgn * FX.ZAR_PER_NGN).toFixed(2)}`;

    // Deduct sender FX
    adjustBalance(cur, -amt);

    const id = txId();
    addTx({
      id,
      type: "debit",
      title: "Cross-border FX",
      detail: `${cur} → ${country} • ${bank} • ${name}`,
      amount: amt,
      currency: cur,
      time: nowStamp()
    });
    renderTx();
    addAlert(`FX sent: ${formatMoney(amt, cur)} to ${country} (${name}).`);
    renderAlerts();

    closeModal();
    showReceipt({
      title: "Receipt • Cross-border FX",
      lines: [
        ["You sent", formatMoney(amt, cur)],
        ["Fee", formatMoney(fee, cur)],
        ["Payout country", country],
        ["They receive", receiveStr],
        ["Receiver bank", bank],
        ["Receiver name", name],
        ["Receiver acct", acct.replace(/.(?=.{4})/g, "*")],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 FX Receipt (demo)\nSent ${formatMoney(amt, cur)} to ${country}\nReceiver: ${name}\nThey receive: ${receiveStr}\nTx: ${id}`
    });
  });

  // Wire dynamic conversion + banks
  setTimeout(() => {
    const amtEl = document.getElementById("fxAmt");
    const curEl = document.getElementById("fxCur");
    const countryEl = document.getElementById("fxCountry");
    const bankEl = document.getElementById("fxBank");

    const receiveEl = document.getElementById("fxReceive");
    const feeEl = document.getElementById("fxFee");
    const rateEl = document.getElementById("fxRate");

    const refresh = () => {
      const amt = Number(amtEl.value || 0);
      const cur = curEl.value;
      const country = countryEl.value;

      // banks
      if (country) {
        bankEl.disabled = false;
        const list = BANKS[country] || [];
        bankEl.innerHTML = list.map(b => `<option>${b}</option>`).join("");
      } else {
        bankEl.disabled = true;
        bankEl.innerHTML = `<option>— Select payout country first —</option>`;
      }

      // conversion only if payout selected
      if (!country || amt <= 0) {
        receiveEl.textContent = "—";
        feeEl.textContent = "—";
        rateEl.textContent = "—";
        return;
      }

      const fee = Math.max(1, amt * 0.01);
      const netAmt = Math.max(0, amt - fee);

      const ngnRate =
        cur === "USD" ? FX.NGN_PER_USD :
        cur === "GBP" ? FX.NGN_PER_GBP :
        FX.NGN_PER_EUR;

      const netNgn =
        cur === "USD" ? netAmt * FX.NGN_PER_USD :
        cur === "GBP" ? netAmt * FX.NGN_PER_GBP :
        netAmt * FX.NGN_PER_EUR;

      let receiveStr = "";
      if (country === "NG") receiveStr = formatMoney(netNgn, "NGN");
      if (country === "GH") receiveStr = `GH₵${(netNgn * FX.GHS_PER_NGN).toFixed(2)}`;
      if (country === "KE") receiveStr = `KSh${(netNgn * FX.KES_PER_NGN).toFixed(2)}`;
      if (country === "ZA") receiveStr = `R${(netNgn * FX.ZAR_PER_NGN).toFixed(2)}`;

      receiveEl.textContent = receiveStr;
      feeEl.textContent = formatMoney(fee, cur);
      rateEl.textContent = `1 ${cur} ≈ ₦${ngnRate.toLocaleString("en-NG")}`;
    };

    [amtEl, curEl, countryEl].forEach(x => x.addEventListener("input", refresh));
    [amtEl, curEl, countryEl].forEach(x => x.addEventListener("change", refresh));
    refresh();
  }, 0);
}

function simpleServiceReceipt(title, detail) {
  const id = txId();
  addTx({ id, type: "debit", title, detail, amount: 0, currency: getState().activeCurrency, time: nowStamp() });
  renderTx();
  showReceipt({
    title: `Receipt • ${title}`,
    lines: [
      ["Detail", detail],
      ["Time", nowStamp()],
      ["Transaction ID", id],
    ],
    shareText: `PAY54 Receipt (demo)\n${title}\n${detail}\nTx: ${id}`
  });
}

function flowSavings() {
  openModal("Savings & Goals", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Goal name</label>
      <input id="svName" placeholder="e.g. Holiday"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Target amount (NGN)</label>
      <input id="svTarget" type="number" min="1" placeholder="200000"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Save now (deducts from active wallet)</label>
      <input id="svAmt" type="number" min="1" placeholder="5000"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
    </div>
  `, "Save", () => {
    const name = (document.getElementById("svName").value || "").trim() || "Savings Pot";
    const amt = Number(document.getElementById("svAmt").value || 0);
    const cur = getState().activeCurrency;

    if (amt <= 0) return showToast("Enter amount to save.");
    if (!ensureSufficient(cur, amt)) return showToast("Insufficient balance.");

    adjustBalance(cur, -amt);
    const id = txId();
    addTx({ id, type: "debit", title: "Savings deposit", detail: name, amount: amt, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Savings",
      lines: [
        ["Goal", name],
        ["Saved", formatMoney(amt, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nSaved ${formatMoney(amt, cur)} into ${name}\nTx: ${id}`
    });
  });
}

function flowBills() {
  const cur = getState().activeCurrency;

  openModal("Pay Bills & Top-Up", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Category</label>
      <select id="blCat" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option value="Airtime">Airtime</option>
        <option value="Data">Data</option>
        <option value="Power">Power</option>
        <option value="Water">Water</option>
        <option value="TV">Cable TV</option>
      </select>

      <label>Provider / Bundle</label>
      <select id="blBundle" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option>MTN • ₦5,000</option>
        <option>Airtel • ₦3,000</option>
        <option>Glo • ₦2,000</option>
        <option>DSTV • ₦6,500</option>
      </select>

      <label>Phone / Meter / IUC</label>
      <input id="blRef" placeholder="e.g. 08012345678"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">

      <label>Amount (${cur})</label>
      <input id="blAmt" type="number" min="1" placeholder="6500"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
    </div>
  `, "Pay", () => {
    const cat = document.getElementById("blCat").value;
    const bundle = document.getElementById("blBundle").value;
    const ref = (document.getElementById("blRef").value || "").trim();
    const amt = Number(document.getElementById("blAmt").value || 0);

    if (!ref) return showToast("Enter a reference (phone/meter/IUC).");
    if (amt <= 0) return showToast("Enter a valid amount.");
    if (!ensureSufficient(cur, amt)) return showToast("Insufficient balance.");

    adjustBalance(cur, -amt);
    const id = txId();
    addTx({ id, type: "debit", title: `Bill payment • ${cat}`, detail: `${bundle} • ${ref}`, amount: amt, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Bill Payment",
      lines: [
        ["Category", cat],
        ["Bundle", bundle],
        ["Reference", ref],
        ["Amount", formatMoney(amt, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nPaid ${cat} ${formatMoney(amt, cur)}\nRef: ${ref}\nTx: ${id}`
    });
  });
}

function flowCards() {
  openModal("Virtual & Linked Cards", `
    <div style="font-size:13px;line-height:1.6">
      <p><strong>Virtual Card (masked)</strong></p>
      <p>4242 4242 •••• ••••</p>
      <p><strong>Controls</strong></p>
      <ul>
        <li>Freeze / unfreeze (demo)</li>
        <li>Add linked card (mock)</li>
        <li>Set default / delete (demo)</li>
      </ul>
    </div>
  `, "Done", () => {
    closeModal();
    simpleServiceReceipt("Cards", "Card controls updated (demo)");
  });
}

function flowCheckout() {
  openModal("PAY54 Smart Checkout", `
    <div style="font-size:13px;line-height:1.6">
      <p><strong>Concept (demo):</strong> You approve an e-commerce payment inside PAY54.</p>
      <p>Example: “Jumia checkout request • ₦12,500”</p>
      <button class="btn-pill" id="chkApprove" type="button">Approve</button>
      <button class="btn-pill btn-outline" id="chkDecline" type="button">Decline</button>
    </div>
  `, "Close", () => closeModal());

  setTimeout(() => {
    const approve = document.getElementById("chkApprove");
    const decline = document.getElementById("chkDecline");
    if (approve) approve.onclick = () => { closeModal(); simpleServiceReceipt("Smart Checkout", "Payment approved (demo)"); };
    if (decline) decline.onclick = () => { closeModal(); showToast("Checkout declined (demo)"); };
  }, 0);
}

function flowShop() {
  openModal("Shop on the Fly", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:12px;opacity:.9">Select a category → open partner (demo affiliate).</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
        <button class="btn-pill" id="shopTaxi" type="button">Taxi</button>
        <button class="btn-pill" id="shopFood" type="button">Food</button>
        <button class="btn-pill" id="shopTickets" type="button">Tickets</button>
        <button class="btn-pill" id="shopShops" type="button">Shops</button>
        <button class="btn-pill" id="shopFashion" type="button">Fashion</button>
        <button class="btn-pill" id="shopFlights" type="button">Flights</button>
      </div>
      <div id="shopPartners" style="margin-top:6px;"></div>
    </div>
  `, "Close", () => closeModal());

  setTimeout(() => {
    const partners = {
      Taxi: [{ name:"Uber", url:"https://www.uber.com" }, { name:"Bolt", url:"https://bolt.eu" }],
      Food: [{ name:"Just Eat", url:"https://www.just-eat.co.uk" }, { name:"JumiaFood", url:"https://food.jumia.com.ng" }],
      Tickets: [{ name:"Ticketmaster", url:"https://www.ticketmaster.com" }, { name:"Eventbrite", url:"https://www.eventbrite.com" }],
      Shops: [{ name:"Jumia", url:"https://www.jumia.com.ng" }, { name:"Amazon", url:"https://www.amazon.co.uk" }],
      Fashion: [{ name:"ASOS", url:"https://www.asos.com" }, { name:"Zara", url:"https://www.zara.com" }],
      Flights: [{ name:"Skyscanner", url:"https://www.skyscanner.net" }, { name:"Kayak", url:"https://www.kayak.com" }],
    };

    const out = document.getElementById("shopPartners");
    const render = (cat) => {
      const list = partners[cat] || [];
      out.innerHTML = `
        <div style="font-size:12px;opacity:.9;margin-bottom:6px;">Partners • ${cat}</div>
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;">
          ${list.map(p => `<button class="tile-btn" data-url="${p.url}" type="button">
              <span class="tile-title">${p.name}</span>
              <span class="tile-sub">Opening partner site…</span>
            </button>`).join("")}
        </div>
      `;
      out.querySelectorAll("button[data-url]").forEach(btn => {
        btn.onclick = () => {
          const url = btn.getAttribute("data-url");
          window.open(`${url}?ref=pay54`, "_blank");
          showToast("Opening partner site…");
          simpleServiceReceipt("Shop on the Fly", `Opened partner: ${btn.querySelector(".tile-title").textContent}`);
        };
      });
    };

    document.getElementById("shopTaxi").onclick = () => render("Taxi");
    document.getElementById("shopFood").onclick = () => render("Food");
    document.getElementById("shopTickets").onclick = () => render("Tickets");
    document.getElementById("shopShops").onclick = () => render("Shops");
    document.getElementById("shopFashion").onclick = () => render("Fashion");
    document.getElementById("shopFlights").onclick = () => render("Flights");
  }, 0);
}

function flowInvest() {
  const cur = getState().activeCurrency;
  const portfolio = safeParse(localStorage.getItem(KEYS.PORTFOLIO), []) || [];

  openModal("Investments & Stocks", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:12px;opacity:.9">Buy mock assets → saved locally to “My Portfolio” (demo).</div>

      <label>Asset type</label>
      <select id="ivType" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option value="Investments">Investments</option>
        <option value="Stocks">Stocks</option>
        <option value="Index">Index Funds</option>
        <option value="LagosRealEstate">Lagos Real Estate (Fractional)</option>
      </select>

      <label>Asset</label>
      <select id="ivAsset" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option value="AAPL">AAPL</option>
        <option value="TSLA">TSLA</option>
        <option value="SP500">S&P 500</option>
        <option value="LRE-01">Lagos RE • VI</option>
      </select>

      <label>Buy amount (${cur})</label>
      <input id="ivAmt" type="number" min="1" placeholder="10000"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">

      <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
        <div style="display:flex;justify-content:space-between;"><span style="opacity:.85">USD holding (demo)</span><strong id="ivUsd">—</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;"><span style="opacity:.85">NGN equivalent</span><strong id="ivNgn">—</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px;"><span style="opacity:.85">Transaction fee</span><strong id="ivFee">—</strong></div>
      </div>

      <button class="btn-pill btn-outline" id="ivView" type="button">My Portfolio</button>
    </div>
  `, "Buy", () => {
    const type = document.getElementById("ivType").value;
    const asset = document.getElementById("ivAsset").value;
    const amt = Number(document.getElementById("ivAmt").value || 0);
    const fee = Math.max(1, amt * 0.005); // 0.5% fee demo
    const total = amt + fee;

    if (amt <= 0) return showToast("Enter a valid amount.");
    if (!ensureSufficient(cur, total)) return showToast("Insufficient balance (includes fee).");

    adjustBalance(cur, -total);
    const id = txId();

    // Convert to USD holding for portfolio display (demo)
    const usd = cur === "USD" ? amt : cur === "GBP" ? (amt * FX.NGN_PER_GBP) / FX.NGN_PER_USD : cur === "EUR" ? (amt * FX.NGN_PER_EUR) / FX.NGN_PER_USD : (amt / FX.NGN_PER_USD);
    const ngnEq = usd * FX.NGN_PER_USD;

    const p = safeParse(localStorage.getItem(KEYS.PORTFOLIO), []) || [];
    p.push({ id, type, asset, invested: amt, currency: cur, usdHolding: usd, ngnEquivalent: ngnEq, time: nowStamp() });
    localStorage.setItem(KEYS.PORTFOLIO, JSON.stringify(p));

    addTx({ id, type: "debit", title: "Investment buy", detail: `${type} • ${asset}`, amount: total, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Investment Buy",
      lines: [
        ["Type", type],
        ["Asset", asset],
        ["Invested", formatMoney(amt, cur)],
        ["Fee", formatMoney(fee, cur)],
        ["USD holding (demo)", `$${usd.toFixed(2)}`],
        ["NGN equivalent", `₦${ngnEq.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nBought ${asset} • ${formatMoney(amt, cur)}\nTx: ${id}`
    });
  });

  setTimeout(() => {
    const amtEl = document.getElementById("ivAmt");
    const feeEl = document.getElementById("ivFee");
    const usdEl = document.getElementById("ivUsd");
    const ngnEl = document.getElementById("ivNgn");
    const viewBtn = document.getElementById("ivView");

    const refresh = () => {
      const amt = Number(amtEl.value || 0);
      const fee = Math.max(1, amt * 0.005);
      const usd = cur === "USD" ? amt : cur === "GBP" ? (amt * FX.NGN_PER_GBP) / FX.NGN_PER_USD : cur === "EUR" ? (amt * FX.NGN_PER_EUR) / FX.NGN_PER_USD : (amt / FX.NGN_PER_USD);
      const ngnEq = usd * FX.NGN_PER_USD;

      feeEl.textContent = formatMoney(fee, cur);
      usdEl.textContent = `$${usd.toFixed(2)}`;
      ngnEl.textContent = `₦${ngnEq.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
    };
    amtEl.addEventListener("input", refresh);
    refresh();

    viewBtn.onclick = () => {
      const p = safeParse(localStorage.getItem(KEYS.PORTFOLIO), []) || [];
      openModal("My Portfolio", `
        <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
          ${p.length ? p.slice().reverse().map(x => `
            <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
              <div><strong>${x.asset}</strong> • ${x.type}</div>
              <div style="opacity:.85;margin-top:6px">Invested: ${formatMoney(x.invested, x.currency)} • USD: $${x.usdHolding.toFixed(2)} • NGN: ₦${Math.round(x.ngnEquivalent).toLocaleString("en-NG")}</div>
              <div style="opacity:.75;margin-top:6px">Time: ${x.time}</div>
            </div>
          `).join("") : `<div style="opacity:.85">No assets yet.</div>`}
        </div>
      `, "Close", () => closeModal());
    };
  }, 0);
}

function flowBet() {
  const cur = getState().activeCurrency;
  openModal("Bet Funding (+18)", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label><input type="checkbox" id="bet18"> I am 18+ (required)</label>
      <label>Platform</label>
      <select id="betPlatform" style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
        <option>Bet9ja</option>
        <option>1xBet</option>
        <option>SportyBet</option>
      </select>
      <label>Customer ID</label>
      <input id="betId" placeholder="e.g. 123456"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Amount (${cur})</label>
      <input id="betAmt" type="number" min="1" placeholder="5000"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
    </div>
  `, "Fund", () => {
    if (!document.getElementById("bet18").checked) return showToast("18+ verification required.");
    const platform = document.getElementById("betPlatform").value;
    const id = (document.getElementById("betId").value || "").trim();
    const amt = Number(document.getElementById("betAmt").value || 0);
    if (!id) return showToast("Enter Customer ID.");
    if (amt <= 0) return showToast("Enter a valid amount.");
    if (!ensureSufficient(cur, amt)) return showToast("Insufficient balance.");

    adjustBalance(cur, -amt);
    const tx = txId();
    addTx({ id: tx, type: "debit", title: "Bet funding", detail: `${platform} • ${id}`, amount: amt, currency: cur, time: nowStamp() });
    renderTx();
    closeModal();

    showReceipt({
      title: "Receipt • Bet Funding",
      lines: [
        ["Platform", platform],
        ["Customer ID", id],
        ["Amount", formatMoney(amt, cur)],
        ["Time", nowStamp()],
        ["Transaction ID", tx],
      ],
      shareText: `PAY54 Receipt (demo)\nBet funding ${formatMoney(amt, cur)} • ${platform}\nTx: ${tx}`
    });
  });
}

function flowRisk() {
  openModal("AI Risk Watch", `
    <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
      <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
        <div>⚠ High-value transfer flagged (demo)</div>
        <div style="opacity:.8;margin-top:6px;">Advice: confirm recipient + enable device checks.</div>
      </div>
      <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
        <div>🔐 New device login attempt (demo)</div>
        <div style="opacity:.8;margin-top:6px;">Advice: reset PIN if unknown.</div>
      </div>
      <button class="btn-pill" id="riskRefresh" type="button">Refresh risk feed</button>
    </div>
  `, "Close", () => closeModal());

  setTimeout(() => {
    const r = document.getElementById("riskRefresh");
    if (r) r.onclick = () => {
      addAlert("AI Risk Watch: Risk feed updated (demo).");
      renderAlerts();
      showToast("Risk feed updated");
    };
  }, 0);
}

function flowAgent() {
  openModal("Become an Agent", `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <label>Name</label>
      <input id="agName" placeholder="Your name"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Business name</label>
      <input id="agBiz" placeholder="Business name"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>NIN</label>
      <input id="agNin" placeholder="NIN (demo)"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <label>Address</label>
      <input id="agAddr" placeholder="City / Area"
        style="padding:10px;border-radius:12px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.6);color:#fff;">
      <div style="font-size:12px;opacity:.85">Selfie capture is future scope (demo placeholder).</div>
    </div>
  `, "Submit", () => {
    const name = (document.getElementById("agName").value || "").trim();
    const biz = (document.getElementById("agBiz").value || "").trim();
    const nin = (document.getElementById("agNin").value || "").trim();
    const addr = (document.getElementById("agAddr").value || "").trim();
    if (!name || !biz || !nin || !addr) return showToast("Complete all fields.");

    const id = txId();
    addAlert("Agent application received (demo).");
    renderAlerts();
    closeModal();

    showReceipt({
      title: "Receipt • Agent Application",
      lines: [
        ["Name", name],
        ["Business", biz],
        ["NIN", nin.replace(/.(?=.{2})/g, "*")],
        ["Address", addr],
        ["Time", nowStamp()],
        ["Transaction ID", id],
      ],
      shareText: `PAY54 Receipt (demo)\nAgent application submitted\nName: ${name}\nTx: ${id}`
    });
  });
}

function viewAllTx() {
  const tx = getTx();
  openModal("All Transactions", `
    <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;">
      ${tx.length ? tx.map(t => `
        <div style="padding:10px;border:1px solid rgba(148,163,184,.25);border-radius:14px;">
          <div><strong>${t.type === "credit" ? "🟢" : "🔴"} ${t.title}</strong> • ${formatMoney(t.amount, t.currency)}</div>
          <div style="opacity:.85;margin-top:6px">${t.detail}</div>
          <div style="opacity:.7;margin-top:6px">${t.time} • ${t.id}</div>
        </div>
      `).join("") : `<div style="opacity:.85">No transactions yet.</div>`}
    </div>
  `, "Close", () => closeModal());
}

/* -----------------------
   WIRING
------------------------*/
function wire() {
  // Session protection first
  requireSessionOrRedirect();

  // Theme
  initTheme();

  // User
  renderUser();

  // Currency chips
  document.querySelectorAll("#currencyToggle .chip").forEach((b) => {
    b.addEventListener("click", () => setActiveCurrency(b.dataset.currency));
  });

  // Start state currency
  const state = getState();
  setActiveCurrency(state.activeCurrency || "NGN");

  // Profile
  el("profileBtn").addEventListener("click", openProfile);

  // Logout
  el("logoutBtn").addEventListener("click", doLogout);

  // Balance actions
  el("btnAddMoney").addEventListener("click", flowAddMoney);
  el("btnWithdraw").addEventListener("click", flowWithdraw);
  el("btnShareDetails").addEventListener("click", () => {
    const s = getState();
    const msg = `PAY54 Details (demo)\nAccount: ${s.accountNo}\nTag: ${s.payTag}`;
    waShare(msg);
  });

  // Money moves
  el("mmSend").addEventListener("click", flowSendP2P);
  el("mmReceive").addEventListener("click", flowReceive);
  el("mmAdd").addEventListener("click", flowAddMoney);
  el("mmWithdraw").addEventListener("click", flowWithdraw);
  el("mmBankTransfer").addEventListener("click", flowBankTransfer);
  el("mmRequest").addEventListener("click", flowRequestMoney);

  // Services
  el("svcFx").addEventListener("click", flowCrossBorderFX);
  el("svcSavings").addEventListener("click", flowSavings);
  el("svcBills").addEventListener("click", flowBills);
  el("svcCards").addEventListener("click", flowCards);
  el("svcCheckout").addEventListener("click", flowCheckout);
  el("svcShop").addEventListener("click", flowShop);
  el("svcInvest").addEventListener("click", flowInvest);
  el("svcBet").addEventListener("click", flowBet);
  el("svcRisk").addEventListener("click", flowRisk);
  el("svcAgent").addEventListener("click", flowAgent);

  // Shortcuts
  el("qsAgent").addEventListener("click", flowAgent);
  el("qsSavings").addEventListener("click", flowSavings);
  el("qsShop").addEventListener("click", flowShop);
  el("qsInvest").addEventListener("click", flowInvest);

  // Alerts
  el("btnClearAlerts").addEventListener("click", () => {
    clearAlerts();
    renderAlerts();
    showToast("Alerts cleared");
  });

  // Tx
  el("btnViewAllTx").addEventListener("click", viewAllTx);

  // Initial renders
  renderBalance();
  renderTx();
  renderAlerts();
}

wire();
