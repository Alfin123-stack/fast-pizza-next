"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { LuMail, LuUser } from "react-icons/lu";
import Input from "@/components/ui/Input";
import PasswordField from "@/components/ui/PasswordField";
import PasswordStrength from "@/components/ui/PasswordStrength";
import FormStatus from "@/components/ui/FormStatus";
import { login, register } from "@/app/(auth)/actions";
import { LIMITS, validate, validateField } from "@/lib/validation";

const readValues = (form) => Object.fromEntries(new FormData(form).entries());

// Checks run as you go (when you leave a field, then on every keystroke once it has been wrong) and again on submit.
// The server runs the same rules (lib/validation.js), so the form also works without JavaScript.
export default function AuthForm({ mode, next = "", reason = "" }) {
  const isLogin = mode === "login";
  const [state, formAction, pending] = useActionState(isLogin ? login : register, {});
  const v = state?.values ?? {};
  const q = next ? `?next=${encodeURIComponent(next)}${reason ? `&reason=${reason}` : ""}` : "";

  const formRef = useRef(null);
  const [errors, setErrors] = useState({}); // errors found in the browser
  const [touched, setTouched] = useState({});
  const [dismissed, setDismissed] = useState({}); // server errors for fields edited since
  const [clientStatus, setClientStatus] = useState(null);
  const [password, setPassword] = useState("");

  // A new answer from the server replaces whatever the browser thought.
  useEffect(() => {
    setDismissed({});
    setErrors({});
  }, [state]);

  const errorFor = (name) => errors[name] ?? (dismissed[name] ? undefined : state?.errors?.[name]);

  function check(name, values) {
    setErrors((e) => {
      const message = validateField(mode, name, values);
      const { [name]: _gone, ...rest } = e;
      return message ? { ...rest, [name]: message } : rest;
    });
  }

  function onBlur(event) {
    const name = event.target.name;
    if (!name || name === "next") return;
    setTouched((t) => ({ ...t, [name]: true }));
    check(name, readValues(formRef.current));
  }

  function onChange(event) {
    const name = event.target.name;
    if (!name || name === "next") return;
    const values = readValues(formRef.current);
    setDismissed((d) => ({ ...d, [name]: true }));
    if (name === "password") setPassword(values.password);
    if (touched[name] || errors[name]) check(name, values);
    if (name === "password" && (touched.confirm || errors.confirm)) check("confirm", values);
    setClientStatus((s) => (s && Object.keys(validate(mode, values)).length === 0 ? null : s));
  }

  function onSubmit(event) {
    const found = validate(mode, readValues(formRef.current));
    if (Object.keys(found).length) {
      event.preventDefault();
      setErrors(found);
      setTouched(Object.fromEntries(Object.keys(found).map((k) => [k, true])));
      setClientStatus({ errors: found });
    } else {
      setClientStatus(null);
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={onSubmit}
      onBlur={onBlur}
      onChange={onChange}
      className="space-y-5"
      noValidate
      aria-label={isLogin ? "Sign in" : "Create account"}
    >
      <input type="hidden" name="next" value={next} />

      {!isLogin && (
        <Input
          icon={LuUser}
          label="Name"
          name="name"
          autoComplete="name"
          autoCapitalize="words"
          placeholder="e.g. Ayu Rahma"
          maxLength={LIMITS.nameMax}
          defaultValue={v.name}
          error={errorFor("name")}
          required
        />
      )}

      <div>
        <Input
          icon={LuMail}
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="email"
          spellCheck={false}
          placeholder="you@example.com"
          maxLength={LIMITS.emailMax}
          defaultValue={v.email}
          error={errorFor("email")}
          required
        />
        {!isLogin && state?.exists && !dismissed.email && (
          <p className="mt-2 text-caption">
            <Link href={`/login${q}`} className="hit underline underline-offset-4">
              Sign in with this email instead
            </Link>
          </p>
        )}
      </div>

      <div>
        <PasswordField
          label="Password"
          name="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          hint={isLogin ? undefined : "Use at least 8 characters."}
          error={errorFor("password")}
          required
        />
        {!isLogin && <PasswordStrength value={password} />}
      </div>

      {!isLogin && (
        <PasswordField
          label="Confirm password"
          name="confirm"
          autoComplete="new-password"
          hint="Type it again to be sure."
          error={errorFor("confirm")}
          required
        />
      )}

      <FormStatus state={clientStatus ?? state} />

      <Button type="submit" disabled={pending} aria-disabled={pending} className="w-full">
        {pending ? (isLogin ? "Signing in..." : "Creating account...") : isLogin ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-body-sm text-pewter">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={(isLogin ? "/register" : "/login") + q} className="hit text-oven-dark underline underline-offset-4">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
