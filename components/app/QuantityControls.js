"use client";

import { useDispatch, useSelector } from "react-redux";
import { LuMinus, LuPlus, LuTrash2 } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { decreaseItemQuantity, deleteItem, getItemQuantityById, increaseItemQuantity } from "@/lib/cartSlice";

export default function QuantityControls({ pizzaId, name, iconDelete = false }) {
  const dispatch = useDispatch();
  const quantity = useSelector(getItemQuantityById(pizzaId));
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <Button variant="round" className="max-sm:!size-8" aria-label={`Remove one ${name}`} onClick={() => dispatch(decreaseItemQuantity(pizzaId))}>
        <Icon as={LuMinus} className="size-4" />
      </Button>
      <span className="min-w-4 text-center text-body-sm font-medium" role="status" aria-label={`${name} quantity`}>
        {quantity}
      </span>
      <Button variant="round" className="max-sm:!size-8" aria-label={`Add one ${name}`} onClick={() => dispatch(increaseItemQuantity(pizzaId))}>
        <Icon as={LuPlus} className="size-4" />
      </Button>
      <button
        type="button"
        aria-label={`Delete ${name} from cart`}
        onClick={() => dispatch(deleteItem(pizzaId))}
        className={iconDelete ? "hit ml-1 inline-flex size-9 items-center justify-center rounded-pill text-oven-dark transition-colors hover:bg-flour" : "hit ml-1 text-caption underline underline-offset-4 hover:opacity-70"}
      >
        {iconDelete ? (
          <Icon as={LuTrash2} className="size-4" />
        ) : (
          <span className="inline-flex items-center gap-1"><Icon as={LuTrash2} className="size-3.5" />Delete</span>
        )}
      </button>
    </div>
  );
}
