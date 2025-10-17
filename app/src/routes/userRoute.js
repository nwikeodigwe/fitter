const express = require("express");
const { user } = require("../utils/User");
const { style } = require("../utils/Style");
const { collection } = require("../utils/Collection");
const { status } = require("http-status");
const router = express.Router();

router.get("/", async (req, res) => {
  let users = await user.findMany();

  if (users.length <= 1)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ users });
});

router.post("/:user/subscribe", async (req, res) => {
  user.id = req.params.user;
  let isUser = await user.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribed(req.params.user);

  if (isSubscribed)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  let subscription = await user.subscribe(req.params.user);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: subscription });
});

router.delete("/:user/unsubscribe", async (req, res) => {
  user.id = req.params.user;
  let isUser = await user.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribed(req.params.user);

  if (!isSubscribed)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  await user.unsubscribe(req.params.user);

  return res.status(status.NO_CONTENT).end();
});

router.get("/me", async (req, res) => {
  user.id = req.user.id;
  const isUser = await user.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], user });
});

router.get("/:user/style", async (req, res) => {
  user.id = req.params.user;
  const isUser = await user.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const styles = await style.findMany({ authorId: user.id });

  if (!styles.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], styles });
});

router.get("/:user/collection", async (req, res) => {
  user.id = req.params.user;
  const isUser = await user.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const collections = await collection.findMany({ authorId: req.params.user });

  if (!collections.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], collections });
});

router.patch("/me", async (req, res) => {
  user.id = req.user.id;
  user.name = req.body.name;
  user.email = req.body.email;

  const data = await user.save();

  return res.status(status.OK).json({ message: status[status.OK], data });
});

router.patch("/profile", async (req, res) => {
  user.id = req.user.id;

  const data = {
    ...(req.body.firstname !== undefined && { firstname: req.body.firstname }),
    ...(req.body.lastname !== undefined && { lastname: req.body.lastname }),
    ...(req.body.bio !== undefined && { bio: req.body.lastname }),
  };

  if (!data)
    return res
      .status(status.BAD_GATEWAY)
      .json({ message: status.BAD_REQUEST, error: true });

  const profile = await user.updateProfile(data);

  return res.status(status.OK).json({ message: status[status.OK], profile });
});

router.patch("/password", async (req, res) => {
  user.id = req.user.id;

  let password = await user.passwordMatch(req.body.password);

  if (!password)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  user.password = req.body.newpassword;
  await user.save();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], success: true });
});

router.get("/:user", async (req, res) => {
  user.id = req.params.user;
  const data = await user.find();

  if (!data)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], data });
});

router.post("/refresh/token", async (req, res) => {
  if (!req.body.token)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const isValidToken = await user.verifyToken(req.body.token);

  if (!isValidToken)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  user.id = req.user.id;
  const token = await user.generateAccessToken();

  return res.status(status.OK).json({ message: status[status.OK], token });
});

module.exports = router;
