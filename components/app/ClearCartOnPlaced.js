"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCartHydrated } from "@/lib/cartSlice";

// After a successful checkout, empty the cart once it has loaded from storage.
export default function ClearCartOnPlaced({ placed, code }) {
  const dispatch = useDispatch();
  const hydrated = useSelector(getCartHydrated);

  useEffect(() => {
    if (!placed || !hydrated) return;
    dispatch(clearCart());
    window.history.replaceState(null, "", `/order/${code}`);
  }, [placed, hydrated, code, dispatch]);

  return null;
}
