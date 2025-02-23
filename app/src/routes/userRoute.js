const express = require("express");
const User = require("../utils/User");
const Style = require("../utils/Style");
const Collection = require("../utils/Collection");
const { status } = require("http-status");
const router = express.Router();

router.get("/", async (req, res) => {
  let user = new User();
  let users = await user.findMany();

  if (users.length <= 1)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ users });
});

router.post("/:user/subscribe", async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  let userExists = await user.findById();

  if (!userExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribedTo(req.params.user);

  if (isSubscribed)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let subscription = await user.subscribeTo(req.params.user);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: subscription });
});

router.delete("/:user/unsubscribe", async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  let userExists = await user.findById();

  if (!userExists)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  user.id = req.user.id;
  let isSubscribed = await user.isSubscribedTo(req.params.user);

  if (!isSubscribed)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  await user.unsubscribeFrom(req.params.user);

  return res.status(status.NO_CONTENT).end();
});

router.get("/me", async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user = await user.find();

  if (!user)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], data: {} });
});

router.get("/:user/style", async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.find();

  if (!user)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  let style = new Style();
  style = await style.findMany({ authorId: user.id });

  if (!style.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: style });
});

router.get("/:user/collection", async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.find();

  if (!user)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND] });

  let collection = new Collection();
  collection = await collection.findMany({ authorId: user.id });

  if (!collection.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: collection });
});

router.patch("/me", async (req, res) => {
  let user = new User();
  user.id = req.user.id;
  user.name = req.body.name;
  user.email = req.body.email;

  user = await user.save();

  return res.status(status.OK).json({ message: status[status.OK], data: user });
});

router.patch("/profile", async (req, res) => {
  let user = new User();
  user.id = req.user.id;

  const data = {
    ...(req.body.firstname !== undefined && { firstname: req.body.firstname }),
    ...(req.body.lastname !== undefined && { lastname: req.body.lastname }),
    ...(req.body.bio !== undefined && { bio: req.body.lastname }),
  };

  const profile = await user.updateProfile(data);

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: profile });
});

router.patch("/password", async (req, res) => {
  let user = new User();
  user.id = req.user.id;

  let password = await user.passwordMatch(req.body.password);

  if (!password)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  user.password = req.body.newpassword;
  await user.save();

  return res.status(status.OK).json({ message: status[status.OK], data: {} });
});

router.get("/:user", async (req, res) => {
  let user = new User();
  user.id = req.params.user;
  user = await user.findById();

  if (!user)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], data: user });
});

router.post("/refresh/token", async (req, res) => {
  if (!req.body.token)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  const isValidToken = await user.verifyToken(req.body.token);

  if (!isValidToken)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  let user = new User();
  user.id = req.user.id;
  const token = await user.generateAccessToken();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: token });
});

module.exports = router;
