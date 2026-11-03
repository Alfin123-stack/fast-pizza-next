import Navbar from "@/components/layout/Navbar";
import StoreProvider from "@/components/app/StoreProvider";
import OrderGateProvider from "@/components/app/OrderGate";
import CartBar from "@/components/app/CartBar";
import { getUser } from "@/lib/data";

export default async function AppLayout({ children }) {
  const user = await getUser();
  return (
    <StoreProvider>
      <OrderGateProvider loggedIn={!!user}>
        <Navbar showSearch />
        <main id="main" tabIndex={-1} className="compact mx-auto min-h-[70dvh] w-full max-w-[1200px] px-4 pb-32 pt-6 outline-none sm:px-6 sm:pt-8 md:pt-12">{children}</main>
        <CartBar />
      </OrderGateProvider>
    </StoreProvider>
  );
}
