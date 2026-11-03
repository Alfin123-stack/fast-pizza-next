import NavbarShell from "./NavbarShell";
import SearchOrder from "@/components/app/SearchOrder";
import { getUser } from "@/lib/data";
import { signOut } from "@/app/(auth)/actions";

// overlay: floats over a dark hero and turns into two pills after scrolling (landing page).
export default async function Navbar({ showSearch = false, overlay = false }) {
  const user = await getUser();
  return (
    <NavbarShell
      overlay={overlay}
      user={user ? { name: user.name?.split(" ")[0] ?? "" } : null}
      signOutAction={signOut}
      search={showSearch ? <SearchOrder /> : null}
    />
  );
}
