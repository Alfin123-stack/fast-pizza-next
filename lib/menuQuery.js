// Everything about what /menu shows, kept pure: reading the URL, filtering, sorting, grouping and paging.
// The URL is the single source of truth (?tab=drinks&q=feta&f=vegetarian,spicy&sort=price-asc&view=list&page=2),
// so a view can be shared, the back button works, and the server can render it without any client state.

export const PAGE_SIZE = { grid: 9, list: 10 };

export const TABS = [
  { id: "pizzas", category: "pizza", label: "Pizzas", noun: "pizzas" },
  { id: "drinks", category: "drink", label: "Drinks", noun: "drinks" },
];

export const FILTERS = {
  pizza: [
    { id: "vegetarian", label: "Vegetarian" },
    { id: "spicy", label: "Spicy" },
    { id: "nodairy", label: "No dairy" },
    { id: "nofish", label: "No fish" },
  ],
  drink: [
    { id: "caffeinefree", label: "Caffeine-free" },
    { id: "hot", label: "Hot" },
    { id: "cold", label: "Cold" },
    { id: "sparkling", label: "Sparkling" },
  ],
};
const COMMON = [{ id: "available", label: "Available only" }];
export const FAVOURITES = { id: "fav", label: "My favourites" };

export const SORTS = [
  { id: "default", label: "Recommended" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "fastest", label: "Fastest to make" },
  { id: "name", label: "Name: A to Z" },
];

export const GROUP_ORDER = {
  pizza: ["Classics", "Without meat", "Spicy", "Cheese lovers", "Seafood"],
  drink: ["Soft drinks", "Juices & lemonade", "Coffee & tea", "Water"],
};

export const filtersFor = (category) => [...FILTERS[category], ...COMMON];

const one = (v) => (Array.isArray(v) ? v[0] : v);

// searchParams (any shape: object from Next or URLSearchParams) -> a clean state object.
export function parseState(sp) {
  const get = (k) => (typeof sp?.get === "function" ? sp.get(k) : one(sp?.[k]));
  const tab = TABS.some((t) => t.id === get("tab")) ? get("tab") : "pizzas";
  const category = TABS.find((t) => t.id === tab).category;
  const allowed = new Set([...filtersFor(category).map((f) => f.id), FAVOURITES.id]);
  const f = String(get("f") ?? "")
    .split(",")
    .filter((id, i, a) => allowed.has(id) && a.indexOf(id) === i);
  const q = String(get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
  const sort = SORTS.some((s) => s.id === get("sort")) ? get("sort") : "default";
  const view = get("view") === "list" ? "list" : "grid";
  const page = Math.max(1, Math.floor(Number(get("page"))) || 1);
  const item = Number(get("item") ?? get("pizza"));
  return { tab, category, q, f, sort, view, page, item: Number.isInteger(item) && item > 0 ? item : null };
}

// state (+ changes) -> "/menu?..." with defaults left out. Changing anything but the page goes back to page 1.
export function hrefFor(state, patch = {}) {
  const next = { ...state, ...patch };
  if (!("page" in patch)) next.page = 1;
  if ("tab" in patch && patch.tab !== state.tab) {
    next.f = [];
    next.page = 1;
  }
  const p = new URLSearchParams();
  if (next.tab !== "pizzas") p.set("tab", next.tab);
  if (next.q) p.set("q", next.q);
  if (next.f.length) p.set("f", next.f.join(","));
  if (next.sort !== "default") p.set("sort", next.sort);
  if (next.view !== "grid") p.set("view", next.view);
  if (next.page > 1) p.set("page", String(next.page));
  const s = p.toString();
  return s ? `/menu?${s}` : "/menu";
}

const groupIndex = (item) => {
  const i = GROUP_ORDER[item.category]?.indexOf(item.group) ?? -1;
  return i === -1 ? 99 : i;
};

const SORTERS = {
  default: (a, b) => groupIndex(a) - groupIndex(b) || a.id - b.id,
  "price-asc": (a, b) => a.unitPrice - b.unitPrice || a.id - b.id,
  "price-desc": (a, b) => b.unitPrice - a.unitPrice || a.id - b.id,
  fastest: (a, b) => a.prepMinutes - b.prepMinutes || a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function queryMenu(menu, state, { favourites = [] } = {}) {
  const favSet = new Set(favourites);
  const inTab = menu.filter((i) => i.category === state.category);
  const words = state.q.toLowerCase().split(" ").filter(Boolean);

  const matches = inTab.filter((i) => {
    if (words.length) {
      const hay = `${i.name} ${(i.ingredients ?? []).join(" ")} ${i.group ?? ""}`.toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return state.f.every((id) => {
      if (id === "available") return !i.soldOut;
      if (id === "fav") return favSet.has(i.id);
      return i.tags.includes(id);
    });
  });
  matches.sort(SORTERS[state.sort]);

  const size = PAGE_SIZE[state.view];
  const pages = Math.max(1, Math.ceil(matches.length / size));
  const page = Math.min(state.page, pages);
  const start = (page - 1) * size;
  const items = matches.slice(start, start + size);

  return {
    items,
    total: matches.length,
    page,
    pages,
    from: items.length ? start + 1 : 0,
    to: start + items.length,
    counts: { pizza: menu.filter((i) => i.category === "pizza").length, drink: menu.filter((i) => i.category === "drink").length },
  };
}

// Consecutive items with the same group share a heading (only used for the "Recommended" order).
export function groupRuns(items) {
  const runs = [];
  for (const item of items) {
    const last = runs.at(-1);
    if (last && last.group === item.group) last.items.push(item);
    else runs.push({ group: item.group, items: [item] });
  }
  return runs;
}

export const hasActiveFilters = (state) => state.q !== "" || state.f.length > 0 || state.sort !== "default";
