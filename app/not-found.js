import { LuSearchX } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <Icon as={LuSearchX} className="size-12 text-oven-dark/70" />
      <h1 className="text-heading-lg font-whisper md:text-display">We couldn&apos;t find that page.</h1>
      <p className="max-w-md text-body-sm text-pewter">
        The link may be wrong, or the order belongs to a different account.
      </p>
      <Button href="/menu">Back to the menu</Button>
    </main>
  );
}
