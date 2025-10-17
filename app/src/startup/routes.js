const express = require("express");
const actionRoute = require("../routes/actionRoute");
const authRoute = require("../routes/authRoute");
const userRoute = require("../routes/userRoute");
const brandRoute = require("../routes/brandRoute");
const styleRoute = require("../routes/styleRoute");
const itemRoute = require("../routes/itemRoute");
const collectionRoute = require("../routes/collectionRoute");
const commentRoute = require("../routes/commentRoute");
const newsletterRoute = require("../routes/newsletterRoute");
const searchRoute = require("../routes/searchRoute");
const error = require("../middleware/error");
const morgan = require("../middleware/morgan");
const auth = require("../middleware/auth");
const limiter = require("../middleware/limiter");
const passport = require("passport");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");

const ALLOWED_ORIGIN = [
  process.env.FRONTEND_ORIGIN,
  process.env.TRANSFORMER_ORIGIN,
];

module.exports = (app) => {
  app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
  app.use(helmet());
  app.use(limiter);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use("/doc", swaggerUi.serve);
  app.get("/docs", swaggerUi.setup(swaggerDocument));
  app.use("/api/auth", authRoute);
  app.use("/api/collection", collectionRoute);
  app.use("/api/brand", brandRoute);
  app.use("/api/style", styleRoute);
  app.use("/api/item", itemRoute);
  app.use("/api/search", searchRoute);
  app.use("/api/newsletter", newsletterRoute);
  app.use(auth);
  app.use("/api", actionRoute);
  app.use("/api/comment", commentRoute);
  app.use("/api/user", userRoute);
  app.use(error);
  app.use(morgan);
};
