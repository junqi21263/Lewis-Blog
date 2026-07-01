import { errorResponse, jsonResponse, methodNotAllowed, withErrorHandling } from "../../_lib/api";
import { listPublishedCorpus, relatedCorpusItems } from "../../_lib/ai";

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const url = new URL(context.request.url);
    const source = url.searchParams.get("source")?.trim() ?? "";
    if (!source) {
      return errorResponse("source is required.");
    }

    const corpus = await listPublishedCorpus(context.env.DB);
    const related = relatedCorpusItems(corpus, source, 4);

    return jsonResponse({
      data: related.map((item) => ({
        type: item.type,
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        href: item.href,
        tags: item.tags,
      })),
    });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
