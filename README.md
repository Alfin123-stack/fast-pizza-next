# Fast React Pizza (Next.js)

Pizza ordering app on Next.js (App Router) with a Seed-inspired layout and motion:
tomato red + cheese yellow on warm cream, whisper-light headlines (weight 350), pill controls, no shadows, no gradients.

## Stack
Next.js 16, React 19, Tailwind CSS v4, MongoDB Atlas (`mongodb` driver), custom auth (bcryptjs + signed JWT cookie via `jose`), Redux Toolkit (cart), Motion (animation).

## Setup
1. `.env.local` needs `DB_URL` (your Atlas connection string) and `AUTH_SECRET` (`openssl rand -hex 32`). See `.env.example`.
2. In MongoDB Atlas > Network Access, allow your IP (or `0.0.0.0/0` while developing / for Vercel).
3. `npm install && npm run dev`

Database: `fast-react-pizza`. Collections are created on first use: `users`, `orders`, and `menu`
(the menu is seeded with 8 pizzas from `lib/seed.js` the first time it is empty; edit that list or the collection to change it).

## Routes
| Route | What |
|---|---|
| `/` | Landing page |
| `/login`, `/register` | Email + password accounts |
| `/menu`, `/cart` | Public |
| `/order/new`, `/order/[code]` | Require sign-in (`proxy.js`) |

## Security notes
- Passwords are hashed with bcrypt; the session is an httpOnly, signed cookie (7 days).
- Order prices are recalculated on the server from the `menu` collection.
- The PIN is generated on the server and shown once from an httpOnly cookie. Updating an order needs the right PIN within 5 minutes of ordering, and locks after 5 wrong tries.
- Orders are only readable by the account that created them. Never commit `.env.local`.

## Placeholders to replace
Landing copy, testimonials, seeded pizzas, and the flat pizza illustrations (`components/ui/PizzaArt.js`). Add an `imageUrl` to menu documents to show real photos.

## Fonts
Seed Sans is proprietary, so the project uses Inter (variable, supports weight 350) and JetBrains Mono.

## Conveyor-belt menu and ordering

The landing page shows today's menu on a conveyor belt (`components/ui/sushi-conveyor-menu.tsx`, used unmodified). Adding a pizza
requires an account: signed-out visitors get a login prompt (`components/app/OrderGate.js`). See CHANGES.md.

## Menu cards and details

/menu uses `components/ui/menu-item-card.tsx` and opens a details dialog (`/menu?pizza=3`). The description, prep time, size and portion
of each pizza are placeholders in `lib/seed.js`: replace them (and add `calories` if you want it shown). See CHANGES.md.

## Landing animations
All original animations are kept as designed: Lenis smooth scroll, hero entrance, scroll-driven Anatomy section, parallax,
rotating ingredient ring, testimonial carousel, marquee, footer reveal. Helpers live in `components/motion/` and follow `prefers-reduced-motion`.
Motion now loads through `LazyMotion` (`components/motion/MotionProvider.js`): same animations, less JavaScript.
Run `npm install` after unzipping.

## Landing page copy
All landing text lives in `content/landing.js`. Claims are limited to what the app does: about 30 minutes delivery
(20 with priority), a 5-minute PIN edit window, pay on delivery. The three testimonials in `components/landing/Testimonials.js`
are still the original PLACEHOLDERS: replace them with real customer quotes before launch.

## Accessibility (WCAG 2.2 AA target)
Skip link, landmarks, one `h1` per page, labelled sections and lists; forms with persistent labels, hints, linked errors and focus on
the first invalid field; carousel with pause button and live-region announcements; invisible 44px touch targets (`.hit`) so visual
sizes did not change; reduced-motion users see every Anatomy step; content stays visible without JavaScript.

## Performance
Menu query cached for 5 minutes (`unstable_cache`, tag `menu`), seed check once per process, LazyMotion, sitemap/robots/canonical/Open Graph/JSON-LD
(set `NEXT_PUBLIC_SITE_URL` in production).

## Responsive
Desktop type sizes are unchanged; below that the scale shrinks smoothly (rem based). No horizontal overflow from 320px to 2560px,
mobile menu anchored to the header (it used to collapse after scrolling), safe-area padding for the cart bar.

## Fonts
Seed Sans is proprietary, so the project uses Inter (variable, supports weight 350) and JetBrains Mono.

## Menu data, drinks and badges

`lib/seed.js` holds the menu (24 pizzas, 16 drinks), all of it placeholder content except pizzas 1-8's names. Missing ids are inserted on first start. Illustrations are generated SVGs (`/pizza-plate`, `/pizza-photo`, `/drink-photo`). "Popular" is computed from real orders (`lib/popular.js`: top 3 per category in 30 days, at least 5 units) and stays hidden until there is data. Menu state is in the URL (`lib/menuQuery.js`).

## Checkout, map and order history

Shop details, opening hours, time zone and the map's starting point are placeholders in `lib/checkout.js`. The map uses Leaflet with OpenStreetMap tiles (no API key; attribution is shown; respect the tile usage policy for real traffic or switch to a tile provider). Address lookup from the map or "Use my location" calls bigdatacloud's free reverse-geocoding endpoint from the browser. Order progress (`lib/orderStatus.js`) is estimated from the clock. Saved addresses live in the `addresses` collection.

## Order page and security notes

See CHANGES.md ("Security and bug audit", "Order page redesign"). New server actions: `cancelOrder`, `rateOrder` (in `app/(app)/order/actions.js`). New components: `PinCard`, `OrderActions`, `OrderMap`, `RateOrder`; `OrderTracker` was rebuilt.
