import dotenv from "dotenv";
dotenv.config();

import express from "express";
import logger from "./utils/logger";
import routes from "./startup/routes";
import prod from "./startup/prod";

import "./auth/passport";

export const app = express();
routes(app);
prod(app);

if (require.main === module) {
  app.listen(process.env.PORT, async () => {
    logger.info(`Listening on port ${process.env.PORT}...`);
  });
}
