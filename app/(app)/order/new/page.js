import CheckoutForm from "@/components/app/CheckoutForm";
import { getAddresses, getLastPhone, getUser } from "@/lib/data";

export const metadata = { title: "Checkout", robots: { index: false } };

export default async function NewOrderPage() {
  const user = await getUser();
  const [addresses, phone] = await Promise.all([getAddresses(), getLastPhone()]);
  return (
    <>
      <h1 className="text-heading-lg font-whisper md:text-display">Ready to order?</h1>
      <CheckoutForm defaultName={user?.name ?? ""} defaultPhone={phone} addresses={addresses} />
    </>
  );
}
