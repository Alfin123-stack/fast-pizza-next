// Side-view drink illustrations for the menu cards (16:10, on the same brown table as the pizza photos).
// The shape (`art`) and liquid colour (`color`) come from the menu row; sold-out drinks are drawn in greys.

const steam = '<g fill="none" stroke="#fff8ec" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"><path d="M146 62c-8-8 8-14 0-24"/><path d="M162 58c-8-8 8-14 0-24"/><path d="M178 62c-8-8 8-14 0-24"/></g>';

function shape(art, c, hot, glass) {
  const ice = `<g fill="#fff8ec" fill-opacity=".35"><rect x="138" y="86" width="16" height="16" rx="3" transform="rotate(-12 146 94)"/><rect x="160" y="100" width="16" height="16" rx="3" transform="rotate(10 168 108)"/><rect x="146" y="118" width="16" height="16" rx="3" transform="rotate(-6 154 126)"/></g>`;
  switch (art) {
    case "tall":
      return `<path d="M128 38h64l-6 122h-52z" fill="${glass}" fill-opacity=".28" stroke="${glass}" stroke-opacity=".7" stroke-width="2"/><path d="M130.5 70h59l-4 90h-51z" fill="${c}"/>${ice}<path d="M176 14 160 112" stroke="#fff8ec" stroke-width="5" stroke-linecap="round"/>`;
    case "can":
      return `<rect x="128" y="42" width="64" height="116" rx="10" fill="${c}"/><rect x="128" y="86" width="64" height="30" fill="#fff8ec" fill-opacity=".85"/><ellipse cx="160" cy="42" rx="32" ry="7" fill="#fff8ec" fill-opacity=".6"/><rect x="128" y="132" width="64" height="26" rx="10" fill="#000" fill-opacity=".12"/>`;
    case "bottle":
      return `<path d="M150 30h20v38c0 10 24 14 24 34v50c0 6-4 10-10 10h-48c-6 0-10-4-10-10v-50c0-20 24-24 24-34z" fill="${c}" fill-opacity=".9" stroke="#fff8ec" stroke-opacity=".6" stroke-width="2"/><rect x="148" y="24" width="24" height="10" rx="3" fill="#3b1510"/><rect x="132" y="104" width="56" height="30" fill="#fff8ec" fill-opacity=".85"/>`;
    case "cup":
      return `${hot ? steam : ""}<ellipse cx="160" cy="156" rx="70" ry="9" fill="#fff8ec" fill-opacity=".8"/><path d="M118 84h84v38c0 22-16 34-42 34s-42-12-42-34z" fill="#fffcf5"/><path d="M202 96h14c12 0 12 24 0 24h-14" fill="none" stroke="#fffcf5" stroke-width="8"/><ellipse cx="160" cy="84" rx="42" ry="8" fill="${c}"/>`;
    case "small":
      return `${hot ? steam : ""}<ellipse cx="160" cy="152" rx="52" ry="8" fill="#fff8ec" fill-opacity=".8"/><path d="M134 104h52v22c0 14-10 22-26 22s-26-8-26-22z" fill="#fffcf5"/><path d="M186 112h9c8 0 8 14 0 14h-9" fill="none" stroke="#fffcf5" stroke-width="6"/><ellipse cx="160" cy="104" rx="26" ry="5" fill="${c}"/>`;
    default:
      return `<path d="M118 62h84l-9 98h-66z" fill="${glass}" fill-opacity=".28" stroke="${glass}" stroke-opacity=".7" stroke-width="2"/><path d="M121 90h78l-6 70h-66z" fill="${c}"/>${ice}`;
  }
}

export function drinkSvg(item, soldOut = false) {
  const c = soldOut ? "#a39b94" : item?.color ?? "#c23a25";
  const table = soldOut ? "#8a817b" : "#7a3b2a";
  const glass = soldOut ? "#d8d3ce" : "#fff8ec";
  const art = item?.art ?? "glass";
  const hot = item?.serving === "Hot";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200" width="640" height="400"><rect width="320" height="200" fill="${table}"/><ellipse cx="160" cy="160" rx="74" ry="10" fill="#000" fill-opacity=".25"/>${shape(art, c, hot, glass)}</svg>`;
}
