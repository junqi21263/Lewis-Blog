import { methodNotAllowed } from "../_lib/api";

export const onRequestPost: PagesFunction<Env> = () => methodNotAllowed();
