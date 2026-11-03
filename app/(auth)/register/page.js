import AuthShell from "@/components/layout/AuthShell";
import AuthForm from "@/components/app/AuthForm";
import { ORDER_GATE } from "@/content/landing";

export const metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }) {
  const { next, reason } = await searchParams;
  return (
    <AuthShell title="Create your account" subtitle={reason === "order" ? ORDER_GATE.loginNote : "It takes a minute, and your orders stay yours."}>
      <AuthForm mode="register" next={typeof next === "string" ? next : ""} reason={reason === "order" ? "order" : ""} />
    </AuthShell>
  );
}
