import { jsonResponse, nowIso, requireAccess, withErrorHandling } from "../../../_lib/api";
import { deterministicSummary, deterministicTags, embedText, listPublishedCorpus, type AiEnv } from "../../../_lib/ai";

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const blocked = requireAccess(context);
    if (blocked) return blocked;

    const env = context.env as AiEnv;
    const corpus = await listPublishedCorpus(context.env.DB);
    let vectorized = 0;

    for (const item of corpus) {
      const timestamp = nowIso();
      const summary = deterministicSummary(item.content);
      const suggestedTags = deterministicTags(item.content, 8);
      const embeddingId = `${item.type}:${item.id}`;

      await context.env.DB
        .prepare(
          `INSERT INTO ai_documents (
            id, source_type, source_id, slug, title, content, summary, tldr, key_takeaways,
            reading_difficulty, suggested_tags, embedding_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(source_type, source_id) DO UPDATE SET
            slug = excluded.slug,
            title = excluded.title,
            content = excluded.content,
            summary = excluded.summary,
            tldr = excluded.tldr,
            key_takeaways = excluded.key_takeaways,
            reading_difficulty = excluded.reading_difficulty,
            suggested_tags = excluded.suggested_tags,
            embedding_id = excluded.embedding_id,
            updated_at = excluded.updated_at`,
        )
        .bind(
          crypto.randomUUID(),
          item.type,
          item.id,
          item.slug ?? null,
          item.title,
          item.content,
          summary.summary,
          summary.tldr,
          JSON.stringify(summary.keyTakeaways),
          summary.readingDifficulty,
          JSON.stringify(suggestedTags),
          embeddingId,
          timestamp,
          timestamp,
        )
        .run();

      if (env.AI && env.VECTOR_INDEX && env.CF_PAGES_BRANCH !== "local") {
        const embedding = await embedText(env, item.content);
        if (embedding) {
          await env.VECTOR_INDEX.insert([
            {
              id: embeddingId,
              values: embedding,
              metadata: {
                type: item.type,
                sourceId: item.id,
                title: item.title,
                href: item.href,
              },
            },
          ]);
          vectorized += 1;
        }
      }
    }

    return jsonResponse({ data: { indexed: corpus.length, vectorized } });
  });
