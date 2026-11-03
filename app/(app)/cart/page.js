import CartView from "@/components/app/CartView";
import { getFavouriteIds, getMenu, getPopularIds, getUser } from "@/lib/data";

export const metadata = { title: "Your cart", robots: { index: false } };

export default async function CartPage() {
  const [menu, user, popular] = await Promise.all([getMenu(), getUser(), getPopularIds()]);
  const favourites = user ? await getFavouriteIds() : [];
  // Only what the cart needs: names, sizes, prep time and stock for the lines, plus the drinks to suggest.
  const slim = menu.map(({ id, name, unitPrice, category, sizeLabel, prepMinutes, soldOut, ingredients, badges }) => ({
    id, name, unitPrice, category, sizeLabel, prepMinutes, soldOut, ingredients: ingredients ?? [], chef: !!badges?.includes("chef"),
  }));
  return <CartView menu={slim} name={user?.name?.split(" ")[0]} popular={popular} favourites={favourites} />;
}
