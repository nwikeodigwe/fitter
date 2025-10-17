const express = require("express");
const { user } = require("../utils/User");
const { status } = require("http-status");
const router = express.Router();

router.post("/signup", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  user.email = req.body.email;
  user.password = req.body.password;

  const isUser = await user.find();

  if (isUser)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  await user.save();
  await user.mail("welcome");

  const login = await user.login();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], login });
});

router.post("/signin", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  user.email = req.body.email;
  user.password = req.body.password;

  const isUser = await user.find();

  if (!isUser)
    return res.status(status.NOT_FOUND).json({
      message: status[status.NOT_FOUND],
      error: true,
    });

  const isPassword = await user.passwordMatch();

  if (!isPassword)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  const login = await user.login();

  return res.status(status.OK).json({ message: status[status.OK], login });
});

router.post("/reset", async (req, res) => {
  if (!req.body.email)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  user.email = req.body.email;
  const isUser = await user.find();

  if (!isUser)
    return res.status(status.NOT_FOUND).json({
      message: status[status.NOT_FOUND],
      error: true,
    });

  await user.createResetToken();

  return res.status(status.OK).end();
});

router.post("/reset/:token", async (req, res) => {
  if (!req.params.token || !req.body.password)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  user.resetToken = req.params.token;

  const isValidResetToken = await user.isValidResetToken();

  if (!isValidResetToken)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  user.password = req.body.password;
  user.id = isValidResetToken.user.id;

  await user.save();

  login = await user.login();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: login });
});

module.exports = router;
