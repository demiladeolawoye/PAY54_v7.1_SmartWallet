/* =========================================================
   PAY54 v7.1 — Global State Manager
   Source of truth for user, session & OTP
   ========================================================= */

const PAY54_STATE_KEYS = {
  USER: "pay54_user",
  SESSION: "pay54_session",
  OTP: "pay54_otp_verified"
};

/* -------------------------
   User state
-------------------------- */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(PAY54_STATE_KEYS.USER));
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(
    PAY54_STATE_KEYS.USER,
    JSON.stringify(user)
  );
}

export function clearUser() {
  localStorage.removeItem(PAY54_STATE_KEYS.USER);
}

/* -------------------------
   Session state
-------------------------- */
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(PAY54_STATE_KEYS.SESSION));
  } catch (e) {
    return null;
  }
}

export function setSession() {
  const session = {
    loggedIn: true,
    device: "browser",
    timestamp: Date.now()
  };
  localStorage.setItem(
    PAY54_STATE_KEYS.SESSION,
    JSON.stringify(session)
  );
}

export function clearSession() {
  localStorage.removeItem(PAY54_STATE_KEYS.SESSION);
}

/* -------------------------
   OTP state (mocked)
-------------------------- */
export function setOtpVerified(value = true) {
  localStorage.setItem(
    PAY54_STATE_KEYS.OTP,
    JSON.stringify(value)
  );
}

export function isOtpVerified() {
  return JSON.parse(
    localStorage.getItem(PAY54_STATE_KEYS.OTP) || "false"
  );
}

export function clearOtp() {
  localStorage.removeItem(PAY54_STATE_KEYS.OTP);
}

/* -------------------------
   Global reset (logout / dev)
-------------------------- */
export function clearAllState() {
  clearUser();
  clearSession();
  clearOtp();
}

