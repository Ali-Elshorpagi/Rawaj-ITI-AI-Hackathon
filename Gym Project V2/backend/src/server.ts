import appFactory from "./app"; // Import the app factory function
import { config } from "./shared/config";
import { getSwaggerDocsUrl } from "./swagger/swaggerUrl";

// Create the app with a configuration object (e.g., isProd)
const app = appFactory();

// Start the server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Swagger UI: ${getSwaggerDocsUrl()}`);
});
