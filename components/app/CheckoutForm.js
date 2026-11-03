"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormStatus from "@/components/ui/FormStatus";
import EmptyCart from "./EmptyCart";
import AddressMap from "./AddressMap";
import { createOrder } from "@/app/(app)/order/actions";
import { deleteAddress } from "@/app/(app)/order/addresses";
import { getCartHydrated, getCartItems, getTotalCartPrice } from "@/lib/cartSlice";
import { fetchAddress } from "@/lib/userSlice";
import { LuBike, LuCalendarClock, LuLocateFixed, LuMap, LuMapPin, LuPhone, LuShoppingBag, LuStickyNote, LuStore, LuUser, LuX, LuZap } from "react-icons/lu";
import Icon from "@/components/ui/Icon";
import { MAX_ADDRESSES, NOTE_MAX, SHOP, formatSlot, priceFor, slotsFrom } from "@/lib/checkout";
import { formatCurrency } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const choice = (on) =>
  cn(
    "flex cursor-pointer flex-col gap-0.5 rounded-card border-[1.5px] px-3 py-2 sm:py-3 sm:px-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2",
    on ? "border-oven-dark bg-flour" : "border-oven-dark/30 hover:bg-flour/60"
  );

function Choice({ name, value, checked, onChange, title, hint, disabled, icon }) {
  return (
    <label className={cn(choice(checked), disabled && "cursor-not-allowed opacity-60")}>
      <span className="flex items-center gap-3">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} disabled={disabled} className="size-4 accent-[#3b1510]" />
        <span className="text-body-sm font-medium">{title}</span>
        {icon && <Icon as={icon} className="ml-auto size-4 text-pewter" />}
      </span>
      {hint && <span className="pl-7 text-label text-pewter sm:text-caption">{hint}</span>}
    </label>
  );
}

export default function CheckoutForm({ defaultName, defaultPhone = "", addresses = [] }) {
  const dispatch = useDispatch();
  const hydrated = useSelector(getCartHydrated);
  const cart = useSelector(getCartItems);
  const subtotal = useSelector(getTotalCartPrice);
  const { status, error: locationError } = useSelector((s) => s.user);
  const [state, formAction, pending] = useActionState(createOrder, {});
  const [, startDelete] = useTransition();

  const v = state?.values ?? {};
  const [fulfilment, setFulfilment] = useState(v.fulfilment ?? "delivery");
  const [when, setWhen] = useState(v.when ?? "asap");
  const [priority, setPriority] = useState(!!v.priority);
  const [address, setAddress] = useState(v.address ?? "");
  const [position, setPosition] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [note, setNote] = useState(v.note ?? "");
  const [slots, setSlots] = useState(null);
  const [slot, setSlot] = useState(v.slot ?? "");
  const [saved, setSaved] = useState(addresses);
  const [save, setSave] = useState(false);

  useEffect(() => setSlots(slotsFrom()), []);
  useEffect(() => setSaved(addresses), [addresses]);
  useEffect(() => {
    if (slots?.length && !slots.includes(slot)) setSlot(slots[0]);
  }, [slots, slot]);

  // "Use my location" fills the address and the pin.
  const located = useSelector((s) => s.user);
  const [lastLocated, setLastLocated] = useState("");
  useEffect(() => {
    if (located.address && located.position && located.position !== lastLocated) {
      setLastLocated(located.position);
      setAddress(located.address);
      setPosition(located.position);
    }
  }, [located.address, located.position, lastLocated]);

  const delivery = fulfilment === "delivery";
  const canPriority = delivery && when === "asap";
  const { fee, total } = useMemo(() => priceFor({ subtotal, priority: priority && canPriority }), [subtotal, priority, canPriority]);

  if (!hydrated) return <p role="status" className="py-16 text-body-sm text-pewter">Loading your cart…</p>;
  if (!cart.length) return <EmptyCart />;

  const errors = state?.errors ?? {};
  const matchesSaved = saved.some((a) => a.address === address.trim());

  return (
    <div className="mt-5 grid gap-6 sm:mt-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <form action={formAction} className="max-w-2xl space-y-5 sm:space-y-8" aria-label="Delivery details">
        <fieldset>
          <legend className="mb-3 text-body-sm font-medium">How do you want it?</legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Choice name="fulfilment" value="delivery" checked={delivery} onChange={() => setFulfilment("delivery")} icon={LuBike} title="Delivery" hint="We bring it to your door." />
            <Choice name="fulfilment" value="pickup" checked={!delivery} onChange={() => setFulfilment("pickup")} icon={LuShoppingBag} title="Pickup" hint="Collect it at the restaurant." />
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <Input icon={LuUser} label="Name" name="customer" autoComplete="name" defaultValue={v.customer ?? defaultName} error={errors.customer} required />
          <Input icon={LuPhone} label="Phone number" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="e.g. +62 812 3456 7890" defaultValue={v.phone ?? defaultPhone} error={errors.phone} required />
        </div>

        {delivery ? (
          <div>
            {saved.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-caption font-medium" id="saved-title">Saved addresses</p>
                <ul aria-labelledby="saved-title" className="flex flex-wrap gap-2">
                  {saved.map((a) => (
                    <li key={a.id} className="flex items-center rounded-pill border-[1.5px] border-oven-dark">
                      <button
                        type="button"
                        onClick={() => {
                          setAddress(a.address);
                          setPosition(a.position || "");
                        }}
                        aria-pressed={a.address === address.trim()}
                        className={cn("hit rounded-l-pill px-4 py-2 text-caption", a.address === address.trim() && "bg-oven-dark text-cream")}
                        title={a.address}
                      >
                        <span className="inline-flex items-center gap-1.5"><Icon as={LuMapPin} className="size-3.5" />{a.label}</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove saved address ${a.label}`}
                        onClick={() => startDelete(async () => { await deleteAddress(a.id); setSaved((s) => s.filter((x) => x.id !== a.id)); })}
                        className="hit rounded-r-pill px-3 py-2 text-caption hover:bg-flour"
                      >
                        <Icon as={LuX} className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Input
              icon={LuMapPin}
              label="Delivery address"
              name="address"
              autoComplete="street-address"
              placeholder="Street, number, city"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setPosition("");
              }}
              disabled={status === "loading"}
              error={errors.address}
              required
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="inverted" className="btn-sm !px-3.5 !py-1.5 !text-caption" disabled={status === "loading"} onClick={() => dispatch(fetchAddress())}>
                <Icon as={LuLocateFixed} className="size-4" />
                {status === "loading" ? "Finding you..." : "Use my location"}
              </Button>
              <Button variant="inverted" className="btn-sm !px-3.5 !py-1.5 !text-caption" aria-expanded={mapOpen} aria-controls="address-map" onClick={() => setMapOpen((o) => !o)}>
                <Icon as={LuMap} className="size-4" />
                {mapOpen ? "Hide map" : "Pick on map"}
              </Button>
              {locationError && <p role="alert" className="text-caption">{locationError}</p>}
            </div>
            {mapOpen && (
              <div id="address-map">
                <AddressMap
                  position={position}
                  onPick={(pos, text) => {
                    setPosition(pos);
                    if (text) setAddress(text);
                  }}
                />
              </div>
            )}
            {address.trim() && !matchesSaved && saved.length < MAX_ADDRESSES && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <label className="hit flex items-center gap-2 text-caption">
                  <input type="checkbox" name="saveAddress" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-4" />
                  Save this address
                </label>
                {save && (
                  <label className="flex items-center gap-2 text-caption">
                    <span>Name it</span>
                    <input name="addressLabel" maxLength={30} placeholder="Home" className="min-h-9 w-36 rounded-input border-[1.5px] border-oven-dark/60 bg-transparent px-3 text-caption" />
                  </label>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-card bg-flour p-4 text-body-sm">
            <p className="flex items-center gap-2 font-medium"><Icon as={LuStore} className="size-4" />Pick it up at</p>
            <p className="mt-1">{SHOP.name}</p>
            <p className="text-pewter">{SHOP.address}</p>
          </div>
        )}

        <fieldset>
          <legend className="mb-3 text-body-sm font-medium">{delivery ? "When?" : "When will you pick it up?"}</legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Choice name="when" value="asap" checked={when === "asap"} onChange={() => setWhen("asap")} icon={LuZap} title="As soon as possible" hint={delivery ? "About 30 minutes." : "About 15 to 20 minutes."} />
            <Choice name="when" value="later" checked={when === "later"} onChange={() => setWhen("later")} disabled={!slots?.length} icon={LuCalendarClock} title="Later" hint={slots && !slots.length ? "Closed for the next 24 hours." : "Choose a time."} />
          </div>
          {when === "later" && slots?.length > 0 && (
            <div className="mt-4 max-w-xs">
              <label htmlFor="slot" className="mb-2 block text-caption font-medium">
                Time <span className="font-normal text-pewter">({SHOP.timeZone.replace("_", " ")}, open {SHOP.open}:00 to {SHOP.close}:00)</span>
              </label>
              <select
                id="slot"
                name="slot"
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                aria-invalid={errors.slot ? true : undefined}
                aria-describedby={errors.slot ? "slot-error" : undefined}
                className="min-h-11 w-full rounded-input border-[1.5px] border-oven-dark/60 bg-cream px-4 text-body-sm"
              >
                {slots.map((s) => (
                  <option key={s} value={s}>{formatSlot(s)}</option>
                ))}
              </select>
              {errors.slot && <p id="slot-error" className="mt-2 text-caption text-tomato">{errors.slot}</p>}
            </div>
          )}
        </fieldset>

        {canPriority && (
          <div className="flex items-center gap-3">
            <input id="priority" name="priority" type="checkbox" checked={priority} onChange={(e) => setPriority(e.target.checked)} className="size-5" />
            <label htmlFor="priority" className="text-body-sm">
              <Icon as={LuZap} className="mr-1.5 inline size-4 align-[-0.15em]" />Priority delivery: about 20 minutes for 20% extra
            </label>
          </div>
        )}

        <div>
          <label htmlFor="note" className="mb-2 block text-caption font-medium">
            <Icon as={LuStickyNote} className="mr-1.5 inline size-4 align-[-0.15em]" />Note for the kitchen or driver <span className="font-normal text-pewter">(optional)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={NOTE_MAX}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. no chili flakes, ring the bell twice"
            aria-invalid={errors.note ? true : undefined}
            aria-describedby="note-count"
            className="w-full rounded-input border-[1.5px] border-oven-dark/60 bg-transparent px-5 py-3.5 text-body-sm placeholder:text-pewter focus:border-oven-dark"
          />
          <p id="note-count" className="mt-1 text-right text-caption text-pewter">
            {note.length}/{NOTE_MAX}
          </p>
          {errors.note && <p className="text-caption text-tomato">{errors.note}</p>}
        </div>

        <input type="hidden" name="cart" value={JSON.stringify(cart)} />
        <input type="hidden" name="position" value={delivery ? position : ""} />

        <FormStatus state={state} />

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Placing your order..." : `Place order · ${formatCurrency(total)}`}
          </Button>
          <p className="mt-3 text-caption text-pewter">You pay {delivery ? "on delivery" : "when you pick it up"}.</p>
        </div>
      </form>

      <aside aria-labelledby="co-summary" className="rounded-card bg-flour p-4 sm:p-6 lg:sticky lg:top-28">
        <h2 id="co-summary" className="text-subheading font-whisper">Your order</h2>
        <ul aria-label="Items in your order" className="mt-4 space-y-2 text-body-sm">
          {cart.map((i) => (
            <li key={i.pizzaId} className="flex justify-between gap-4">
              <span>
                {i.quantity}× {i.name}
              </span>
              <span>{formatCurrency(i.totalPrice)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-oven-dark/25 pt-4 text-body-sm">
          <div className="flex justify-between gap-4">
            <dt>Items</dt>
            <dd>{formatCurrency(subtotal)}</dd>
          </div>
          {fee > 0 && (
            <div className="flex justify-between gap-4">
              <dt>Priority</dt>
              <dd>{formatCurrency(fee)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 text-body font-medium">
            <dt>Total</dt>
            <dd>{formatCurrency(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-caption text-pewter">
          {delivery ? "Delivery" : "Pickup"} · {when === "later" && slot ? formatSlot(slot) : "as soon as possible"}
        </p>
      </aside>
    </div>
  );
}
