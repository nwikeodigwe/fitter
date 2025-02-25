const User = require("../utils/User");
const { status } = require("http-status");

module.exports = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token)
    return res
      .status(status.UNAUTHORIZED)
      .json({ error: status[status.UNAUTHORIZED] });

  let user = new User();
  let decode = user.verifyToken(token);

  if (!decode)
    return res
      .status(status.FORBIDDEN)
      .json({ error: status[status.FORBIDDEN] });

  req.user = decode;
  next();
};
