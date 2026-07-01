import { renderOgImage } from "../_lib/og";

export const onRequestGet: PagesFunction = async (context) => {
  const origin = new URL(context.request.url).origin;
  const image = await renderOgImage(origin, {
    title: "Lewis Photograph Blog",
    kicker: "Nordic Editorial Journal",
    subtitle: null,
    footerLabel: "Lewis Photograph Blog",
    titleSize: 94,
    centered: true,
  });

  return new Response(image, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
