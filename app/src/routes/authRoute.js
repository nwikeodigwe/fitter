const express = require("express");
const mailconf = require("../config/mailconf");
const User = require("../utils/User");
const { status } = require("http-status");
const router = express.Router();

router.post("/signup", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  let userExits = await user.find();

  if (userExits)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  await user.save();
  await user.mail(mailconf.welcome);

  const login = await user.login();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: login });
});

router.post("/signin", async (req, res) => {
  if (!req.body.email || !req.body.password)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let user = new User();
  user.email = req.body.email;
  user.password = req.body.password;

  let userExists = await user.find();

  if (!userExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  const passwordMatch = await user.passwordMatch();

  if (!passwordMatch)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  const login = await user.login();

  return res
    .status(status.OK)
    .json({ message: status[status.BAD_REQUEST], data: login });
});

router.post("/reset", async (req, res) => {
  if (!req.body.email)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let user = new User();
  user.email = req.body.email;
  let userExits = await user.find();

  if (!userExits)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  await user.createResetToken();

  return res.status(status.OK).end();
});

router.post("/reset/:token", async (req, res) => {
  if (!req.params.token || !req.body.password)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let user = new User();
  user.resetToken = req.params.token;

  const isValidResetToken = await user.isValidResetToken();

  if (!isValidResetToken)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  user.password = req.body.password;
  user.id = isValidResetToken.user.id;

  await user.save();

  login = await user.login();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: login });
});

module.exports = router;
