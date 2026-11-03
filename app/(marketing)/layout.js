import PromoBanner from "@/components/layout/PromoBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FooterReveal from "@/components/layout/FooterReveal";
import SmoothScroll from "@/components/motion/SmoothScroll";
import StoreProvider from "@/components/app/StoreProvider";
import OrderGateProvider from "@/components/app/OrderGate";
import CartBar from "@/components/app/CartBar";
import { getUser } from "@/lib/data";

export default async function MarketingLayout({ children }) {
  const user = await getUser();
  return (
    <StoreProvider>
      <OrderGateProvider loggedIn={!!user}>
        <SmoothScroll />
        <PromoBanner />
        <Navbar overlay />
        <main id="main" tabIndex={-1} className="relative z-10 bg-cream outline-none">{children}</main>
        <FooterReveal>
          <Footer />
        </FooterReveal>
        <CartBar />
      </OrderGateProvider>
    </StoreProvider>
  );
}
