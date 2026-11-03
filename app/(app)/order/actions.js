"use server";

import { randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/session";
import { EDIT_WINDOW_MS } from "@/lib/helpers";
import { orderProgress } from "@/lib/orderStatus";
import { consume } from "@/lib/rateLimit";
import { MAX_ADDRESSES, NOTE_MAX, SHOP, cleanPosition, isValidSlot, priceFor } from "@/lib/checkout";

const PHONE = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
const MAX_PIN_ATTEMPTS = 5;
const strings = (x) => (Array.isArray(x) ? x.filter((s) => typeof s === "string").slice(0, 30) : []);
const text = (formData, key) => String(formData.get(key) || "").trim();
const MAX = { customer: 80, address: 200 };

function samePin(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function createOrder(_prev, formData) {
  const user = await getSession();
  if (!user) redirect("/login?next=/order/new");

  const pickup = formData.get("fulfilment") === "pickup";
  const later = formData.get("when") === "later";
  const values = {
    customer: text(formData, "customer"),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
    // Priority only makes sense for "as soon as possible" delivery.
    priority: formData.get("priority") === "on" && !pickup && !later,
    fulfilment: pickup ? "pickup" : "delivery",
    when: later ? "later" : "asap",
    slot: text(formData, "slot"),
    note: text(formData, "note"),
  };
  const position = pickup ? "" : cleanPosition(text(formData, "position"));

  let cart = [];
  try {
    cart = JSON.parse(String(formData.get("cart") || "[]"));
  } catch {}
  if (!Array.isArray(cart) || cart.length === 0) return { error: "Your cart is empty.", values };
  if (cart.length > 40 || cart.some((i) => !i || typeof i !== "object" || !Number.isInteger(i.pizzaId))) {
    return { error: "Something is wrong with your cart. Please empty it and add your items again.", values };
  }
  if (!values.customer) return { errors: { customer: "Enter your name." }, values };
  if (values.customer.length > MAX.customer) return { errors: { customer: "Use 80 characters or fewer." }, values };
  if (values.address.length > MAX.address) return { errors: { address: "Use 200 characters or fewer." }, values };
  if (!PHONE.test(values.phone)) return { errors: { phone: "Enter a valid phone number." }, values };
  if (!pickup && !values.address) return { errors: { address: "Enter a delivery address." }, values };
  if (later && !isValidSlot(values.slot)) return { errors: { slot: "Pick a time from the list. Times are within opening hours." }, values };
  if (values.note.length > NOTE_MAX) return { errors: { note: `Keep the note under ${NOTE_MAX} characters.` }, values };

  let orderCode, pin;
  try {
    const db = await getDb();
    if (!(await consume(db, `order:${user.id}`, 8, 10 * 60 * 1000))) {
      return { error: "You have placed several orders in a short time. Please wait a few minutes.", values };
    }

    // Prices come from the database, never from the browser.
    const ids = cart.map((i) => i.pizzaId);
    const menu = await db.collection("menu").find({ id: { $in: ids } }).toArray();

    const lines = [];
    for (const item of cart) {
      const pizza = menu.find((p) => p.id === item.pizzaId);
      if (!pizza || pizza.soldOut) {
        return { error: `${item.name ?? "An item"} isn't available right now. Remove it from your cart.`, values };
      }
      const quantity = Math.floor(Number(item.quantity));
      if (!(quantity >= 1 && quantity <= 20)) {
        return { error: "Each item can be ordered 1 to 20 times.", values };
      }
      const isDrink = pizza.category === "drink";
      lines.push({
        pizzaId: pizza.id,
        category: isDrink ? "drink" : "pizza",
        name: pizza.name,
        quantity,
        unitPrice: pizza.unitPrice,
        totalPrice: pizza.unitPrice * quantity,
        addIngredients: isDrink ? [] : strings(item.addIngredients),
        removeIngredients: isDrink ? [] : strings(item.removeIngredients),
      });
    }

    const orderPrice = lines.reduce((n, l) => n + l.totalPrice, 0);
    orderCode = randomBytes(5).toString("hex").toUpperCase();
    pin = String(randomInt(0, 1_000_000)).padStart(6, "0");

    await db.collection("orders").insertOne({
      orderCode,
      pin,
      pinAttempts: 0,
      userId: user.id,
      customer: values.customer,
      phone: values.phone,
      address: pickup ? `Pickup: ${SHOP.address}` : values.address,
      position,
      fulfilment: values.fulfilment,
      scheduledFor: later ? new Date(values.slot) : null,
      note: values.note,
      priority: values.priority,
      priorityPrice: priceFor({ subtotal: orderPrice, priority: values.priority }).fee,
      orderPrice,
      status: "preparing",
      cart: lines,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error(error);
    return { error: "We couldn't place your order. Please try again.", values };
  }

  // "Save this address": best effort, never blocks the order.
  if (!pickup && formData.get("saveAddress") === "on") {
    try {
      const col = (await getDb()).collection("addresses");
      const label = text(formData, "addressLabel").slice(0, 30) || "Saved address";
      if ((await col.countDocuments({ userId: user.id })) < MAX_ADDRESSES && !(await col.findOne({ userId: user.id, address: values.address }))) {
        await col.insertOne({ id: randomBytes(6).toString("hex"), userId: user.id, label, address: values.address, position, createdAt: new Date() });
      }
    } catch (error) {
      console.error(error);
    }
  }

  // The PIN is shown once on the order page and is never sent to the browser otherwise.
  (await cookies()).set(`pin-${orderCode}`, pin, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });

  redirect(`/order/${orderCode}?placed=1`);
}

export async function updateOrder(_prev, formData) {
  const code = text(formData, "code");
  const pin = text(formData, "pin");
  const values = {
    customer: text(formData, "customer"),
    address: text(formData, "address"),
    phone: text(formData, "phone"),
  };
  const wantsPriority = formData.get("priority") === "on";

  const user = await getSession();
  if (!user) redirect(`/login?next=/order/${code}`);

  if (!pin) return { error: "Enter your PIN to save changes.", values };
  if (!values.customer) return { error: "Name can't be empty.", values };
  if (values.customer.length > MAX.customer || values.address.length > MAX.address) return { error: "That name or address is too long.", values };
  if (!PHONE.test(values.phone)) return { error: "Enter a valid phone number.", values };

  try {
    const orders = (await getDb()).collection("orders");
    const order = await orders.findOne({ orderCode: code, userId: user.id });
    if (!order) return { error: "We couldn't find this order on your account.", values };
    const pickup = order.fulfilment === "pickup";
    if (!pickup && !values.address) return { error: "Name and address can't be empty.", values };
    if (Date.now() > order.createdAt.getTime() + EDIT_WINDOW_MS) {
      return { error: "The 5-minute window to change this order has closed.", values };
    }
    if ((order.pinAttempts ?? 0) >= MAX_PIN_ATTEMPTS) {
      return { error: "Too many wrong PINs. This order can't be changed anymore.", values };
    }
    if (!samePin(order.pin, pin)) {
      await orders.updateOne({ _id: order._id }, { $inc: { pinAttempts: 1 } });
      return { error: "That PIN isn't right.", values };
    }

    // Priority only for delivery that isn't scheduled for later.
    const priority = Boolean(order.priority) || (wantsPriority && !pickup && !order.scheduledFor);
    await orders.updateOne(
      { _id: order._id },
      {
        $set: {
          customer: values.customer,
          ...(pickup ? {} : { address: values.address }),
          phone: values.phone,
          priority,
          priorityPrice: priority ? order.orderPrice * 0.2 : 0,
        },
      }
    );
  } catch (error) {
    console.error(error);
    return { error: "We couldn't update your order. Please try again.", values };
  }

  revalidatePath(`/order/${code}`);
  return { message: "Your order was updated.", values };
}

// Cancel within the same 5-minute window and with the same PIN as editing.
export async function cancelOrder(_prev, formData) {
  const code = text(formData, "code");
  const pin = text(formData, "pin");
  const user = await getSession();
  if (!user) redirect(`/login?next=/order/${code}`);
  if (!pin) return { error: "Enter your PIN to cancel." };

  try {
    const orders = (await getDb()).collection("orders");
    const order = await orders.findOne({ orderCode: code, userId: user.id });
    if (!order) return { error: "We couldn't find this order on your account." };
    if (order.status === "cancelled") return { message: "This order is already cancelled." };
    if (Date.now() > order.createdAt.getTime() + EDIT_WINDOW_MS) return { error: "The 5-minute window has closed. Call the shop to cancel." };
    if ((order.pinAttempts ?? 0) >= MAX_PIN_ATTEMPTS) return { error: "Too many wrong PINs. This order can't be changed anymore." };
    if (!samePin(order.pin, pin)) {
      await orders.updateOne({ _id: order._id }, { $inc: { pinAttempts: 1 } });
      return { error: "That PIN isn't right." };
    }
    await orders.updateOne({ _id: order._id }, { $set: { status: "cancelled", cancelledAt: new Date() } });
  } catch (error) {
    console.error(error);
    return { error: "We couldn't cancel your order. Please try again." };
  }
  revalidatePath(`/order/${code}`);
  revalidatePath("/orders");
  return { message: "Your order was cancelled." };
}

// One rating per finished order.
export async function rateOrder(_prev, formData) {
  const code = text(formData, "code");
  const rating = Number(formData.get("rating"));
  const comment = text(formData, "comment").slice(0, 200);
  const user = await getSession();
  if (!user) redirect(`/login?next=/order/${code}`);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choose 1 to 5 stars." };

  try {
    const orders = (await getDb()).collection("orders");
    const order = await orders.findOne({ orderCode: code, userId: user.id });
    if (!order) return { error: "We couldn't find this order on your account." };
    if (order.rating) return { message: "Thanks, you already rated this order." };
    const view = { created_at: order.createdAt, fulfilment: order.fulfilment, priority: order.priority, scheduledFor: order.scheduledFor, status: order.status };
    if (order.status === "cancelled" || !orderProgress(view).finished) return { error: "You can rate an order once it has arrived." };
    await orders.updateOne({ _id: order._id }, { $set: { rating: { stars: rating, comment, at: new Date() } } });
  } catch (error) {
    console.error(error);
    return { error: "We couldn't save your rating. Please try again." };
  }
  revalidatePath(`/order/${code}`);
  return { message: "Thanks for the feedback!" };
}
