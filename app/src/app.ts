import dotenv from "dotenv";
dotenv.config();

import express from "express";
import logger from "./utils/Logger";
import routes from "./startup/routes";
import prod from "./startup/prod";
import mongoose from "mongoose";

import "./auth/passport";

export const app = express();
routes(app);
prod(app);

if (require.main === module) {
  const mongo_uri = process.env.MONGO_URI || "mongodb://localhost:27017/fitter";
  app.listen(process.env.PORT, async () => {
    await mongoose.connect(mongo_uri);
    logger.info(`Listening on port ${process.env.PORT}...`);
  });
}
