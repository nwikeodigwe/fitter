const express = require("express");
const { users } = require("../utils/User");
const { status } = require("http-status");
const { newsletter } = require("../utils/Newsletter");
const router = express.Router();

router.post("/signup", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  // const user = new User();
  users.email = req.body.email;
  users.password = req.body.password;

  const isUser = await users.find();

  if (isUser)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  if (req.body.subscribe) newsletter.save(users.email);

  await users.save();
  await users.mail("welcome");

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED] })
    .end();
});

router.post("/signin", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  users.email = req.body.email;
  const find = await users.find();

  if (!find)
    return res.status(status.NOT_FOUND).json({
      message: status[status.NOT_FOUND],
      login: {},
    });

  users.password = req.body.password;
  const isPassword = await users.passwordMatch();

  if (!isPassword)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  const login = await users.login();

  return res.status(status.OK).json({ message: status[status.OK], login });
});

router.post("/reset", async (req, res) => {
  if (!req.body.email)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  users.email = req.body.email;
  const isUser = await users.find();

  if (!isUser)
    return res.status(status.NOT_FOUND).json({
      message: status[status.NOT_FOUND],
      error: true,
    });

  await users.createResetToken();

  return res.status(status.OK).end();
});

router.post("/reset/:token", async (req, res) => {
  if (!req.params.token || !req.body.password)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  users.resetToken = req.params.token;

  const isValidResetToken = await users.isValidResetToken();

  if (!isValidResetToken)
    return res.status(status.BAD_REQUEST).json({
      message: status[status.BAD_REQUEST],
      error: true,
    });

  users.password = req.body.password;
  users.id = isValidResetToken.user.id;

  await users.save();

  login = await users.login();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: login });
});

module.exports = router;
