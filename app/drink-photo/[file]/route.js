import { drinkSvg } from "@/lib/drinkArt";
import { SEED_BY_ID } from "@/lib/seed";

// /drink-photo/101.svg and /drink-photo/101-sold.svg. A pure function of the URL, so it can be cached for good.
export async function GET(_request, { params }) {
  const { file } = await params;
  const match = /^(\d{1,4})(-sold)?\.svg$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  return new Response(drinkSvg(SEED_BY_ID[Number(match[1])], Boolean(match[2])), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
