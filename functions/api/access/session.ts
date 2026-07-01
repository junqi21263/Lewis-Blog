import { getAccessIdentity, isLocalRequest, jsonResponse, withErrorHandling } from "../../_lib/api";

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    const identity = getAccessIdentity(context.request);

    return jsonResponse({
      data: {
        authenticated: identity.authenticated || isLocalRequest(context),
        email: identity.email || (isLocalRequest(context) ? "local-dev" : ""),
        hasJwt: identity.hasJwt,
        local: isLocalRequest(context),
      },
    });
  });
