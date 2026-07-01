import {
  jsonResponse,
  methodNotAllowed,
  parseJsonText,
  withErrorHandling,
} from "../../_lib/api";

type PhotoRow = Record<string, unknown> & {
  featured: number;
  tags: string;
};

function serializePhoto(row: PhotoRow) {
  return {
    ...row,
    featured: Boolean(row.featured),
    tags: parseJsonText(row.tags, []),
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const result = await context.env.DB
      .prepare("SELECT * FROM photos ORDER BY featured DESC, taken_at DESC, updated_at DESC")
      .all<PhotoRow>();

    return jsonResponse({ data: result.results.map(serializePhoto) });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
