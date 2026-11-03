import { SEED_BY_ID } from "@/lib/seed";

// Everything the menu cards, the detail dialog, the filters and the badges need to know about a menu item (pizza or drink).
// Diet, heat, allergens and the filter `tags` are worked out from the ingredient list and the drink fields; description, prep time,
// size and portion come from the database row (or the seed values when the row predates those fields). Nothing is invented:
// calories only appear when set.

const MEAT_OR_FISH = /anchov|salami|prosciutto|\bham\b|sausage|pepperoni|bacon|chicken|tuna|salmon|sardine|shrimp|prawn|mussel|clam|squid|calamari|crab|lobster|seafood|beef|meat|nduja|mortadella/i;
const MILK = /mozzarella|cheese|parmesan|gorgonzola|ricotta|feta|cheddar|burrata|cream|milk/i;
const FISH = /anchov|tuna|salmon|sardine/i;
const SHELLFISH = /shrimp|prawn|mussel|clam|squid|calamari|crab|lobster/i;
const NUTS = /nut|pistachio|almond|hazelnut|cashew/i;
const SPICY = /chili|chilli|spicy|jalape|nduja/i;

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const sentence = (list) => (list.length < 2 ? list.join("") : `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`);

export const PIZZA_TAGS = ["vegetarian", "spicy", "nodairy", "nofish"];
export const DRINK_TAGS = ["caffeinefree", "hot", "cold", "sparkling"];

export function enrich(row) {
  const base = { ...SEED_BY_ID[row.id], ...row };
  const category = base.category ?? "pizza";
  const toppings = base.ingredients ?? [];
  const has = (re) => toppings.some((i) => re.test(i));
  const allergens = category === "pizza" ? ["Gluten (wheat dough)"] : [];
  if (has(MILK)) allergens.push("Milk");
  if (has(FISH)) allergens.push("Fish");
  if (has(SHELLFISH)) allergens.push("Shellfish");
  if (has(NUTS)) allergens.push("Nuts");

  const isPizza = category === "pizza";
  const vegetarian = isPizza ? !has(MEAT_OR_FISH) : true;
  const spicy = isPizza ? has(SPICY) : false;
  const tags = isPizza
    ? [
        vegetarian && "vegetarian",
        spicy && "spicy",
        !allergens.includes("Milk") && "nodairy",
        !allergens.includes("Fish") && !allergens.includes("Shellfish") && "nofish",
      ]
    : [!base.caffeine && "caffeinefree", base.serving === "Hot" && "hot", base.serving === "Cold" && "cold", base.sparkling && "sparkling"];

  return {
    ...base,
    category,
    vegetarian,
    spicy,
    allergens,
    tags: tags.filter(Boolean),
    description: base.description || (toppings.length ? `Made with ${sentence(toppings)}.` : ""),
    prepMinutes: base.prepMinutes ?? (isPizza ? 15 : 2),
    sizeCm: base.sizeCm ?? 30,
    portion: base.portion ?? "Serves 1",
    // The line shown under the price on a card.
    sizeLabel: isPizza ? `${base.sizeCm ?? 30} cm · ${base.portion ?? "Serves 1"}` : `${base.volumeMl ?? 330} ml · ${base.serving ?? "Cold"}`,
  };
}

// PZ-01 for pizzas, DR-01 for drinks (drink ids start at 101).
export function itemCode(item) {
  return item.category === "drink" ? `DR-${String(item.id - 100).padStart(2, "0")}` : `PZ-${String(item.id).padStart(2, "0")}`;
}

export { cap };

// 16:10 illustration used on cards, rows and cart lines.
export const photoUrl = (item) => `/${item.category === "drink" ? "drink-photo" : "pizza-photo"}/${item.id}${item.soldOut ? "-sold" : ""}.svg`;
