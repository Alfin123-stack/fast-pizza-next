import { photoSvg } from "@/lib/plate";

// /pizza-photo/3.svg and /pizza-photo/3-sold.svg. The image is a pure function of the URL,
// so it can be cached for good.
export async function GET(_request, { params }) {
  const { file } = await params;
  const match = /^(\d{1,4})(-sold)?\.svg$/.exec(file);
  if (!match) return new Response("Not found", { status: 404 });
  return new Response(photoSvg(Number(match[1]), Boolean(match[2])), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
