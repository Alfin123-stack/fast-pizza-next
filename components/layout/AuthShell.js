import Wordmark from "./Wordmark";
import PizzaArt from "@/components/ui/PizzaArt";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <main id="main" tabIndex={-1} className="flex flex-col px-6 py-8 outline-none md:px-16">
        <header>
          <Wordmark />
        </header>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-heading-lg font-whisper">{title}</h1>
          <p className="mb-8 mt-3 text-body-sm text-pewter">{subtitle}</p>
          {children}
        </div>
      </main>
      <aside aria-label="Why order with us" className="hidden flex-col items-center justify-center gap-10 bg-oven-dark p-16 text-cream md:flex">
        <PizzaArt className="w-full max-w-sm" />
        <p className="max-w-sm text-center text-subheading font-whisper">
          Pick your pizza. Change your details within 5 minutes. Keep track with a PIN only you have.
        </p>
      </aside>
    </div>
  );
}
