"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchOrder() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function onSubmit(e) {
    e.preventDefault();
    const code = query.trim();
    if (!code) return;
    router.push(`/order/${encodeURIComponent(code)}`);
    setQuery("");
  }

  return (
    <form onSubmit={onSubmit} role="search" aria-label="Find your order" className="hidden lg:block">
      <label htmlFor="order-search" className="sr-only">
        Find an order by number
      </label>
      <input
        id="order-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Order number" autoComplete="off" spellCheck={false}
        className="w-36 rounded-pill border-[1.5px] border-oven-dark/60 bg-transparent px-4 py-2.5 text-caption outline-none placeholder:text-pewter focus:border-oven-dark lg:w-48"
      />
    </form>
  );
}
