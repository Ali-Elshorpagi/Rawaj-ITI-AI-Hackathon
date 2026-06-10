import { config } from "../shared/config";

export const SWAGGER_DOCS_PATH = "/api/docs";

/** Full URL to Swagger UI (uses `config.port` on localhost so it matches the bound port). */
export function getSwaggerDocsUrl(): string {
  try {
    const u = new URL(config.app.url);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return `http://${u.hostname}:${config.port}${SWAGGER_DOCS_PATH}`;
    }
    return `${u.origin}${SWAGGER_DOCS_PATH}`;
  } catch {
    return `http://127.0.0.1:${config.port}${SWAGGER_DOCS_PATH}`;
  }
}
