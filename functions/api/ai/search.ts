import { jsonResponse, methodNotAllowed, withErrorHandling } from "../../_lib/api";
import { embedText, lexicalSearch, listPublishedCorpus, type AiEnv } from "../../_lib/ai";

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const env = context.env as AiEnv;
    const url = new URL(context.request.url);
    const query = url.searchParams.get("q")?.trim() ?? "";
    const corpus = await listPublishedCorpus(context.env.DB);
    let results = lexicalSearch(corpus, query, 8);
    let mode: "lexical" | "semantic" = "lexical";

    if (query && env.AI && env.VECTOR_INDEX) {
      const embedding = await embedText(env, query);
      if (embedding) {
        try {
          const vectorResults = await env.VECTOR_INDEX.query(embedding, { topK: 8, returnMetadata: true });
          const matches = vectorResults && typeof vectorResults === "object" ? (vectorResults as { matches?: unknown }).matches : null;
          if (Array.isArray(matches) && matches.length > 0) {
            const ids = matches
              .map((match) => (match && typeof match === "object" ? (match as { id?: unknown }).id : null))
              .filter((id): id is string => typeof id === "string");
            const byId = new Map(corpus.map((item) => [`${item.type}:${item.id}`, item]));
            results = ids.map((id) => byId.get(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
            mode = "semantic";
          }
        } catch {
          mode = "lexical";
        }
      }
    }

    return jsonResponse({
      data: results.map((item) => ({
        type: item.type,
        id: item.id,
        title: item.title,
        description: item.description,
        href: item.href,
        tags: item.tags,
      })),
      meta: { mode },
    });
  });

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
