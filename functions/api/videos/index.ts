import {
  jsonResponse,
  methodNotAllowed,
  withErrorHandling,
} from "../../_lib/api";

type VideoRow = Record<string, unknown> & {
  featured: number;
};

function serializeVideo(row: VideoRow) {
  return {
    ...row,
    featured: Boolean(row.featured),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const result = await context.env.DB
      .prepare("SELECT * FROM videos ORDER BY featured DESC, updated_at DESC")
      .all<VideoRow>();

    return jsonResponse({ data: result.results.map(serializeVideo) });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
