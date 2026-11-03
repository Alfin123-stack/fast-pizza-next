// All landing-page copy lives here so it can be edited (or translated) in one place.
// Voice: warm, direct, specific. Lead with the benefit, one clear action per section.
// Only claims we can back up: ~30 min delivery (20 with priority), a 5-minute PIN edit window,
// pay on delivery, dough rested overnight, baked after you order.

export const SITE = {
  name: "Fast React Pizza",
  tagline: "Build your pizza. We bake it after you order.",
  description:
    "Choose a pizza, take off what you don't like, add what you do. Baked after you order, at your door in about 30 minutes. Pay on delivery.",
};

export const PROMO = {
  text: "Need it faster? Priority delivery arrives in about 20 minutes.",
  cta: "Order with priority",
};

export const HERO = {
  title: "Your pizza, your way, at your door in 30 minutes.",
  body:
    "Pick a pizza, take off what you don't like and add what you do. We bake it after you order, and you pay when it arrives.",
  primary: "Order a pizza",
  secondary: "See how we bake",
};

export const SHOWCASE = {
  title: "Four pizzas to start with.",
  body: "Fresh from today's menu. Open one to see what's on it, then make it yours in your cart.",
  all: "See the full menu",
  badge: "Our classic",
};

export const BUNDLE = {
  badge: "Ordering for a group?",
  title: "Feeding the whole table? Build one order for everyone.",
  body:
    "Mix as many pizzas as you like and tailor each one. Pay on delivery, and fix a typo in your details within 5 minutes using your private PIN.",
  cta: "Build your order",
  figureLabel: "Two example pizzas, PZ-01 and PZ-02",
};

export const HOW = {
  eyebrow: "How it works",
  title: "Order in three simple steps.",
  steps: [
    { title: "Pick your pizzas", body: "Browse the menu and add what you like. You can fill your cart before you sign in." },
    { title: "Make each one yours", body: "Remove ingredients or add extras from your cart. Your changes go with the order." },
    { title: "Order, then track it with a PIN", body: "Sign in to check out and you get a private PIN. Use it to change your details for 5 minutes. Pay when it arrives." },
  ],
  cta: "Start your order",
};

export const ANATOMY = {
  eyebrow: "How we bake",
  title: "Baked in layers, only after you order.",
  figureLabel: "Exploded view of a pizza showing four layers: dough, sauce, cheese and toppings",
  steps: [
    { code: "L1", title: "The dough rests overnight.", body: "Slow proofing gives a light, blistered crust that never turns heavy." },
    { code: "L2", title: "The sauce goes on thin.", body: "Just enough to keep the flavour bright and the base crisp." },
    { code: "L3", title: "Baked hot, never reheated.", body: "Every pizza goes into the oven after you order, not before." },
    { code: "L4", title: "Toppings your way.", body: "Take anything off or add extras. Your changes go with the order." },
  ],
  hint: "Keep scrolling to take it apart",
  stat: { value: "30′", text: "from oven to door, 20 with priority" },
};

export const DISCOVER = {
  eyebrow: "Ingredients",
  title: "Know exactly what's on your pizza.",
  body: "Every pizza lists its ingredients, and you can take any of them off. These are the bases, sauces and cheeses you can add.",
  cta: "Browse the menu",
  listLabel: "Extras you can add",
};

export const TESTIMONIALS = {
  // NOTE: the three stories below are PLACEHOLDERS from the original design. Replace them with real
  // customer quotes before launch (and never invent names or numbers).
  title: "Pizza night, told by the people who ordered.",
  sub: "A few words from customers about building their own pizza.",
  label: "Customer stories",
  prev: "Previous story",
  next: "Next story",
};

export const KITCHEN = {
  title: "A look inside our kitchen.",
  region: "Kitchen highlights, scroll sideways to see more",
  cards: [
    { kind: "pizza", bg: "bg-tomato", title: "Dough, rested overnight" },
    { kind: "box", title: "Boxed to travel" },
    { kind: "slice", bg: "bg-oven-dark", title: "Meet the oven" },
    { kind: "quote", quote: "Fast should never mean careless.", label: "Kitchen note" },
    { kind: "ring", bg: "bg-crust", title: "Every topping, listed", dark: true },
    { kind: "leaf", bg: "bg-basil", title: "Fresh basil" },
  ],
  panelA: {
    title: "Good pizza is a craft.",
    body: "Fast should never mean careless. See how every pizza is made.",
    cta: "See how we bake",
  },
  panelB: {
    title: "Hungry? Ordering takes about a minute.",
    body: "Hot at your door in about 30 minutes.",
    cta: "Order a pizza",
  },
};

export const FOOTER = {
  tagline: "Your pizza, your way, tracked with a private PIN.",
  cta: "Order a pizza",
  giant: "Fresh from the oven.",
  columns: [
    { title: "Order", links: [["/menu", "Menu"], ["/cart", "Cart"], ["/order/new", "Checkout"]] },
    { title: "Our kitchen", links: [["/#story", "How we bake"], ["/#ingredients", "Ingredients"], ["/#stories", "Kitchen"]] },
    { title: "Account", links: [["/login", "Sign in"], ["/register", "Create account"]] },
  ],
};

export const BELT = {
  label: "Today's pizzas",
  eyebrow: "Today's menu",
  title: "Pick your pizza right off the belt.",
  caption: "Hover to pause the belt, drag to spin it, tap a pizza to see what's on it.",
  action: "See the full menu",
  labels: { add: "Add to cart", close: "Close", previous: "Previous pizza", next: "Next pizza", pause: "Pause belt" },
};

// Shown when a visitor who is not signed in tries to add a pizza.
export const ORDER_GATE = {
  title: "Log in to order",
  body: (name) => `${name} is one step away. Sign in, or create a free account, to add it to your cart.`,
  login: "Log in",
  register: "Create account",
  later: "Maybe later",
  close: "Close",
  soldOut: (name) => `${name} is sold out today.`,
  added: (name) => `${name} is in your cart.`,
  welcomeBack: (name) => `Welcome! ${name} is in your cart.`,
  viewCart: "View cart",
  loginNote: "Sign in to add pizzas to your order. Your pick will be waiting.",
};
