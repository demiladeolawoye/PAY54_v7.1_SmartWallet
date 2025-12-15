# PAY54 v7.1 — Smart Wallet (Frozen)

Status: ✅ FROZEN  
Last Updated: 2025-12-14

## Overview
PAY54 v7.1 is a frontend demo build that combines:
- **Auth UI from v6.7** (unchanged, premium, mobile-first)
- **Dashboard UI from v7.0** (unchanged)
- **v7.1 wiring layer** for state, routing, FX mock, wallet & receipts

This version is intended for:
- Investor demos
- UX validation
- Product walkthroughs

No real payments are processed.

---

## Architecture (v7.1)

### Auth
- Login
- Signup
- OTP (mocked: 123456)
- Reset PIN

Source: v6.7 (UI locked)

### Dashboard
- Wallet balances
- Currency switching
- FX mock (“You send / They receive”)
- Transactions
- Receipts

Source: v7.0 (UI locked)

### Core (v7.1)
- Session & routing guards
- Wallet state hydration
- FX engine (deterministic)
- Receipt engine

---

## Storage (Local Only)
The app uses browser `localStorage` only:
- `pay54_user`
- `pay54_session`
- `pay54_otp_verified`
- `pay54_wallet`
- `pay54_fx_state`
- `pay54_last_receipt`

---

## Version Policy
- v7.1 is **frozen**
- Any future changes require a new version (v7.2+)

---

## Disclaimer
This is a UI/UX demo.  
No backend, no real funds, no real payments.

