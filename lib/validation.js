// Rules for the sign-in and sign-up forms. The same functions run in the browser (instant feedback) and in the
// server actions (the real check), so the two can never disagree.

export const LIMITS = { nameMin: 2, nameMax: 80, emailMax: 254, passwordMin: 8, passwordMaxBytes: 72 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const bytes = (s) => new TextEncoder().encode(s).length;

export function nameError(value) {
  const v = String(value ?? "").trim();
  if (!v) return "Enter your name.";
  if (v.length < LIMITS.nameMin) return "Your name needs at least 2 characters.";
  if (v.length > LIMITS.nameMax) return "Use 80 characters or fewer for your name.";
}

export function emailError(value) {
  const v = String(value ?? "").trim();
  if (!v) return "Enter your email.";
  if (v.length > LIMITS.emailMax || !EMAIL.test(v)) return "Enter a valid email address, like you@example.com.";
}

// Signing in only needs a password to be typed; signing up also enforces the length rules.
export function passwordError(value, { signUp = false } = {}) {
  const v = String(value ?? "");
  if (!v) return "Enter your password.";
  if (!signUp) return;
  if (v.length < LIMITS.passwordMin) return "Use a password with at least 8 characters.";
  if (bytes(v) > LIMITS.passwordMaxBytes) return "That password is too long. Use 72 characters or fewer.";
}

export function confirmError(password, confirm) {
  if (!String(confirm ?? "")) return "Type your password again.";
  if (password !== confirm) return "The passwords don't match.";
}

export function validate(mode, v) {
  const errors =
    mode === "login"
      ? { email: emailError(v.email), password: passwordError(v.password) }
      : {
          name: nameError(v.name),
          email: emailError(v.email),
          password: passwordError(v.password, { signUp: true }),
          confirm: confirmError(v.password, v.confirm),
        };
  return Object.fromEntries(Object.entries(errors).filter(([, e]) => e));
}

// One field, for blur/change feedback in the browser.
export function validateField(mode, field, v) {
  return validate(mode, v)[field];
}

const COMMON = new Set(["password", "password1", "12345678", "123456789", "1234567890", "qwertyui", "qwerty123", "iloveyou", "11111111", "00000000", "abcd1234", "letmein1", "welcome1", "admin123"]);

// A hint, not a rule: the only requirement is the length above.
export function passwordStrength(value) {
  const v = String(value ?? "");
  if (!v) return { level: 0, label: "" };
  if (v.length < LIMITS.passwordMin) return { level: 0, label: "Too short" };
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(v)).length;
  let level = 1;
  if (v.length >= 12) level++;
  if (classes >= 3) level++;
  if (v.length >= 16) level++;
  level = Math.min(level, 4);
  if (COMMON.has(v.toLowerCase()) || /^(.)\1+$/.test(v)) level = 1;
  return { level, label: ["Too short", "Weak", "Okay", "Strong", "Very strong"][level] };
}
