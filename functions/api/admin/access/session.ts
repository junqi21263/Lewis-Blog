import { getAccessIdentity, isLocalRequest, requireAccess, jsonResponse, withErrorHandling } from "../../../_lib/api";

export const onRequestGet: PagesFunction<Env> = async (context) =>
  await withErrorHandling(async () => {
    if (!isLocalRequest(context)) {
      const blocked = requireAccess(context);
      if (blocked) {
        return blocked;
      }
    }

    const identity = getAccessIdentity(context.request);

    return jsonResponse({
      data: {
        authenticated: identity.authenticated || isLocalRequest(context),
        email: identity.email || (isLocalRequest(context) ? "local-dev" : ""),
        hasJwt: identity.hasJwt,
        emailSource: identity.emailSource,
        local: isLocalRequest(context),
      },
    });
  });
