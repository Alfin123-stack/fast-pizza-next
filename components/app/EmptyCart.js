import { LuShoppingCart, LuClipboardList } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";

// Empty cart. `lastOrder` (optional, from the account's latest order) adds a one-click way back.
export default function EmptyCart({ as: Heading = "h2" }) {
  return (
    <div className="rounded-panel bg-flour px-6 py-16 text-center">
      <Icon as={LuShoppingCart} className="mx-auto mb-6 size-14 text-oven-dark/70" strokeWidth={1.5} />
      <Heading className="text-heading-sm font-whisper">Your cart is empty.</Heading>
      <p className="mx-auto mt-3 max-w-sm text-body-sm">Pick a pizza or a drink from the menu and it will show up here.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button href="/menu">Browse the menu</Button>
        <Button href="/orders" variant="link">
          <Icon as={LuClipboardList} className="size-4" />Order again from my orders
        </Button>
      </div>
    </div>
  );
}
