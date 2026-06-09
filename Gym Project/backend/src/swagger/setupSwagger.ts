import { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi";
import { SWAGGER_DOCS_PATH } from "./swaggerUrl";

export function setupSwagger(app: Application): void {
  app.use(
    SWAGGER_DOCS_PATH,
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument as unknown as Record<string, unknown>, {
      customSiteTitle: "GymDesk API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
    })
  );

  app.get(`${SWAGGER_DOCS_PATH}/openapi.json`, (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });
}
