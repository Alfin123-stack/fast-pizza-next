import MenuBrowser from "@/components/app/MenuBrowser";
import { getFavouriteIds, getLastOrderLines, getMenu, getPopularIds, getUser } from "@/lib/data";
import { hasActiveFilters, parseState, queryMenu } from "@/lib/menuQuery";

export async function generateMetadata({ searchParams }) {
  const state = parseState(await searchParams);
  const filtered = hasActiveFilters(state) || state.page > 1 || state.item;
  return {
    title: state.tab === "drinks" ? "Drinks menu" : "Menu",
    // Filtered, searched and paged views are the same menu in another order; keep them out of search results.
    robots: filtered ? { index: false, follow: true } : undefined,
    alternates: { canonical: state.tab === "drinks" ? "/menu?tab=drinks" : "/menu" },
  };
}

export default async function MenuPage({ searchParams }) {
  const state = parseState(await searchParams);
  const [menu, popular, user] = await Promise.all([getMenu(), getPopularIds(), getUser()]);
  const [favouriteIds, lastLines] = user ? await Promise.all([getFavouriteIds(), getLastOrderLines()]) : [[], []];
  const result = queryMenu(menu, state, { favourites: favouriteIds });
  return (
    <>
      <h1 className="text-heading-lg font-whisper md:text-display">Our menu</h1>
      <p className="mb-4 mt-2 max-w-lg text-body-sm text-pewter sm:mb-8 sm:mt-3">
        Pizzas and drinks. Open an item to see what's in it, then add it to your cart. You can take off or add pizza ingredients from the cart.
      </p>
      <MenuBrowser menu={menu} state={{ ...state, page: result.page }} result={result} popular={popular} favouriteIds={favouriteIds} lastLines={lastLines} loggedIn={!!user} />
    </>
  );
}
