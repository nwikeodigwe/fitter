const { logger } = require("../utils/Logger");
const { status } = require("http-status");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token)
      return res
        .status(status.UNAUTHORIZED)
        .json({
          message: status[status.UNAUTHORIZED],
          error: "Auth Middleware",
        });

    logger.info("Decoding token...");
    let decode = await jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;
    next();
  } catch (err) {
    logger.error(err);
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: "Auth Error" });
  }
};
