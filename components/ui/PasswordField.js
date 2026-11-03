"use client";

import { useEffect, useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import Icon from "./Icon";
import Input from "./Input";

// Password input with a Show/Hide button and a Caps Lock warning. The button only exists once JavaScript has loaded,
// so there is never a dead control without it.
export default function PasswordField({ onBlur, onKeyDown, onKeyUp, ...props }) {
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const track = (event) => setCaps(event.getModifierState?.("CapsLock") ?? false);

  return (
    <div>
      <Input
        icon={LuLock}
        {...props}
        type={shown ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onKeyDown={(e) => { track(e); onKeyDown?.(e); }}
        onKeyUp={(e) => { track(e); onKeyUp?.(e); }}
        onBlur={(e) => { setCaps(false); onBlur?.(e); }}
        adornment={
          ready && (
            <button
              type="button"
              onClick={() => setShown((s) => !s)}
              aria-label={shown ? "Hide password" : "Show password"}
              className="hit rounded-pill px-3 py-1.5 text-caption underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basil"
            >
              <span className="inline-flex items-center gap-1"><Icon as={shown ? LuEyeOff : LuEye} className="size-3.5" />{shown ? "Hide" : "Show"}</span>
            </button>
          )
        }
      />
      {caps && (
        <p role="status" className="mt-2 text-caption text-pewter">
          Caps Lock is on.
        </p>
      )}
    </div>
  );
}
