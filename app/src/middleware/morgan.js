const morgan = require("morgan");
const logger = require("../utils/Logger");

module.exports = morgan("combined", {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
});
