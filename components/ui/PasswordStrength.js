import { passwordStrength } from "@/lib/validation";

const TONE = ["bg-tomato", "bg-tomato", "bg-crust", "bg-basil", "bg-basil"];

// A suggestion only (the one rule is 8 characters). The label carries the meaning; colour is extra.
export default function PasswordStrength({ value }) {
  const { level, label } = passwordStrength(value);
  if (!value) return <div aria-live="polite" className="min-h-9" />;
  return (
    <div aria-live="polite" className="min-h-9">
      <div aria-hidden="true" className="mt-1 flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-pill ${i <= level ? TONE[level] : "bg-flour"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-caption text-pewter">
        Password strength: <span className="font-medium text-oven-dark">{label}</span>
      </p>
    </div>
  );
}
