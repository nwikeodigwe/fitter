const express = require("express");
const { users } = require("../utils/user");
const { styles } = require("../utils/style");
const { collections } = require("../utils/collection");
const { status } = require("http-status");
const router = express.Router();

router.get("/", async (req, res) => {
  const data = await users.findMany();

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ users: data });
});

router.post("/:user/subscribe", async (req, res) => {
  users.id = req.params.user;
  let isUser = await users.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  users.id = req.user.id;
  let isSubscribed = await users.isSubscribed(req.params.user);

  if (isSubscribed)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  let subscription = await users.subscribe(req.params.user);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], data: subscription });
});

router.delete("/:user/unsubscribe", async (req, res) => {
  users.id = req.params.user;
  let isUser = await users.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  users.id = req.user.id;
  let isSubscribed = await users.isSubscribed(req.params.user);

  if (!isSubscribed)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  await users.unsubscribe(req.params.user);

  return res.status(status.NO_CONTENT).end();
});

router.get("/me", async (req, res) => {
  users.id = req.user.id;
  const isUser = await users.find();

  if (!isUser)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], user: isUser });
});

router.get("/:user/style", async (req, res) => {
  users.id = req.params.user;
  const find = await users.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const data = await styles.findMany({ authorId: users.id });

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], styles: data });
});

router.get("/:user/collection", async (req, res) => {
  users.id = req.params.user;
  const find = await users.find();

  if (!find)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const data = await collections.findMany({ authorId: req.params.user });

  if (!data.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res
    .status(status.OK)
    .json({ message: status[status.OK], collections: data });
});

router.patch("/me", async (req, res) => {
  users.id = req.user.id;
  users.name = req.body.name;
  users.email = req.body.email;

  const data = await users.save();

  return res.status(status.OK).json({ message: status[status.OK], data });
});

router.patch("/profile", async (req, res) => {
  users.id = req.user.id;

  const data = {
    ...(req.body.firstname !== undefined && { firstname: req.body.firstname }),
    ...(req.body.lastname !== undefined && { lastname: req.body.lastname }),
    ...(req.body.bio !== undefined && { bio: req.body.lastname }),
  };

  if (!data)
    return res
      .status(status.BAD_GATEWAY)
      .json({ message: status.BAD_REQUEST, error: true });

  const profile = await users.updateProfile(data);

  return res.status(status.OK).json({ message: status[status.OK], profile });
});

router.patch("/password", async (req, res) => {
  users.id = req.user.id;

  let password = await users.passwordMatch(req.body.password);

  if (!password)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  users.password = req.body.newpassword;
  await users.save();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], success: true });
});

router.get("/:user", async (req, res) => {
  users.id = req.params.user;
  const data = await users.find();

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

  const isValidToken = await users.verifyToken(req.body.token);

  if (!isValidToken)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  users.id = req.user.id;
  const token = await users.generateAccessToken();

  return res.status(status.OK).json({ message: status[status.OK], token });
});

module.exports = router;
