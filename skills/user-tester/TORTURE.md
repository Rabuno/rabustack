# Torture catalog

Abuse cases the mystery shopper runs after each happy path. Apply the sections that fit the flow; report how the app *handles* hostile input — never exploit further.

## Forms

- Submit empty; submit whitespace-only.
- 10,000-character input; emoji and CJK/unicode; leading/trailing spaces.
- `<script>alert(1)</script>` and `' OR 1=1--` in text fields — report if rendered or errored raw.
- Double-click submit button; submit, then browser-back, then submit again.
- Paste into fields that expect typing (masked inputs, OTP boxes).
- Invalid formats: malformed email, birthday in the future, negative quantity, price `0`.

## Navigation

- Refresh mid-flow (mid-wizard, mid-checkout) — is state preserved or corrupted?
- Back/forward through multi-step flow.
- Deep-link to auth-only pages while logged out — expect redirect, not error page or leaked content.
- Same page open in two tabs; act in one, refresh the other.
- Use tab left open after logging out elsewhere.

## Auth & roles

- Wrong password 5×: lockout, rate-limit, or nothing?
- Session expiry mid-form: is the user's typed data lost silently?
- As a low-privilege user, visit high-privilege URLs directly (`/admin`, other users' resource IDs).

## Data volume

- Empty states: 0 items in every list — placeholder or broken layout?
- 1 item; enough items to force pagination; pagination first/last page edges.
- Concurrent edit: change the same record in two tabs, save both.

## Money & balance

- Any flow that moves money: record the balance before and after, and check the delta equals the exact amount expected — a success toast is not proof the math is right.
- Settlement can be async: if the balance hasn't moved yet, wait and re-check before calling it a lost payment — an immediate read is not a final one.
- Split payments (deposits, fees, escrow, refunds): verify every leg lands where it should and the parts sum to the whole.
- Negative, zero, and over-max amounts on every money input; over-max via API too, not just UI.

## Network & console

- Any red console error = bug.
- Failed request with no user-facing feedback = bug.
- Spinner or skeleton that never resolves = blocker.

## Responsive

- Resize to 375px width; run primary flows at that size.
- Fixed elements covering content, horizontal scroll, unreachable buttons.

## Accessibility basics

- Keyboard-only through primary flow: Tab order sane, focus visible, Enter submits.
- Form errors shown next to the offending field, not only as a toast.

## Content

- Long user-generated strings: overflow, truncation, layout break.
- Dates/currency: correct locale and timezone rendering.

## File upload

- Oversized file (past any stated limit); 0-byte file.
- Wrong MIME/extension mismatch (a `.exe` renamed `.jpg`, a text file renamed `.pdf`).
- SVG containing a `<script>` tag — check whether it's sanitized or rendered raw.
- Filename with path-traversal or special characters (`../../etc`, spaces, unicode, very long name).
