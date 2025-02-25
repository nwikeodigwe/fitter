require("dotenv").config();
const express = require("express");
const logger = require("./utils/Logger");
const app = express();

require("./auth/passport");
require("./startup/routes")(app);
require("./startup/prod")(app);

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`Listening on port ${port}...`);
  });
}
