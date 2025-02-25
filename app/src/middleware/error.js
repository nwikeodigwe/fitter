const logger = require("../utils/Logger");
const { status } = require("http-status");

module.exports = function (err, req, res, next) {
  logger.error(err.message, err);
  return res
    .status(status.INTERNAL_SERVER_ERROR)
    .json({ message: status[status.INTERNAL_SERVER_ERROR], data: {} });
};
