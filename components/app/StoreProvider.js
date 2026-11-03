"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";
import { hydrateCart } from "@/lib/cartSlice";

const KEY = "fast-react-pizza:cart";

// Cart lives in Redux and is mirrored to localStorage after the first client render,
// so server and client HTML always match.
export default function StoreProvider({ children }) {
  const ref = useRef(null);
  if (!ref.current) {
    const store = makeStore();
    // Snapshot of the empty cart: React uses it while hydrating, so the first client render
    // matches the server HTML even if the store has already been filled from localStorage.
    ref.current = { store, serverState: store.getState() };
  }

  useEffect(() => {
    const { store } = ref.current;
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch {}
    store.dispatch(hydrateCart(stored));

    let last = store.getState().cart.items;
    return store.subscribe(() => {
      const items = store.getState().cart.items;
      if (items === last) return;
      last = items;
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
    });
  }, []);

  return (
    <Provider store={ref.current.store} serverState={ref.current.serverState}>
      {children}
    </Provider>
  );
}
