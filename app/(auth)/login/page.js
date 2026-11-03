import AuthShell from "@/components/layout/AuthShell";
import AuthForm from "@/components/app/AuthForm";
import { ORDER_GATE } from "@/content/landing";

export const metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const { next, reason } = await searchParams;
  return (
    <AuthShell title="Welcome back" subtitle={reason === "order" ? ORDER_GATE.loginNote : "Sign in to place and track your orders."}>
      <AuthForm mode="login" next={typeof next === "string" ? next : ""} reason={reason === "order" ? "order" : ""} />
    </AuthShell>
  );
}
