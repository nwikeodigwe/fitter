const express = require("express");
const { brands } = require("../utils/brand");
const { users } = require("../utils/user");
const { status } = require("http-status");
const router = express.Router();

const models = { brands, users };

router.post("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "users"];
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.id;
  const isExist = await Model.find();

  if (!isExist)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isSubscribed = await Model.isSubscribed(req.user.id);

  if (isSubscribed)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT], error: true });

  const response = await Model.subscribe(req.user.type_id);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.delete("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brands", "users"];
  const Model = models[req.params.type];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  Model.id = req.params.type_id;
  const isExist = await Model.find();

  if (!isExist)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  const isSubscribed = await Model.isSubscribed(req.user.type_id);

  if (!isSubscribed)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await Model.unsubscribe(req.user.id);

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
