import { errorResponse, jsonResponse, methodNotAllowed, readJsonObject, textField, withErrorHandling } from "../../_lib/api";
import { excerpt, lexicalSearch, listPublishedCorpus, runTextAi, type AiEnv } from "../../_lib/ai";

export const onRequestPost: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const body = await readJsonObject(context.request);
    const question = textField(body, "question", { required: true });
    if (question.length > 500) {
      return errorResponse("Question is too long.", 400);
    }

    const corpus = await listPublishedCorpus(context.env.DB);
    const matches = lexicalSearch(corpus, question, 5);
    const contextText = matches.map((item, index) => `${index + 1}. ${item.title}\n${excerpt(item.content, 900)}`).join("\n\n");
    const fallback =
      matches.length > 0
        ? `Based on the published archive, start with ${matches[0].title}. ${matches[0].description || excerpt(matches[0].content, 180)}`
        : "I could not find enough published archive material to answer that yet.";

    let answer = "";
    if (matches.length > 0) {
      answer = await runTextAi(
        context.env as AiEnv,
        `Answer the question using only this published personal archive context. Keep the tone quiet and concise.\n\nQuestion: ${question}\n\nContext:\n${contextText}`,
      );
    }

    return jsonResponse({
      data: {
        answer: answer || fallback,
        sources: matches.map((item) => ({ title: item.title, href: item.href, type: item.type })),
        mode: answer ? "ai" : "fallback",
      },
    });
  });

export const onRequestGet: PagesFunction<Env> = () => methodNotAllowed();
export const onRequestPut: PagesFunction<Env> = () => methodNotAllowed();
export const onRequestDelete: PagesFunction<Env> = () => methodNotAllowed();
