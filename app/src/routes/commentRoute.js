const express = require("express");
const { brand } = require("../utils/Brand");
const { comment } = require("../utils/Comment");
const { user } = require("../utils/User");
const { style } = require("../utils/Style");
const { collection } = require("../utils/Collection");
const { item } = require("../utils/Item");
const { status } = require("http-status");
const transform = require("../functions/transform");
const auth = require("../middleware/auth");
const router = express.Router();

const models = { brand, item, collection, style, user, comment };

router.post("/:type/:type_id", async (req, res) => {
  const type = req.params.type;
  const valid = ["brand", "item", "style", "collection"];
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

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  comment.content = req.body.content;
  comment.userId = req.user.id;
  comment.entity = type;
  comment.entityId = req.params.type_id;
  comment.tags = req.body.tags && req.body.tags.map((tag) => transform(tag));

  const created = await comment.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], created });
});

// router.post("/:type/:type_id/:comment", async (req, res) => {
//   const type = req.params.type;
//   const valid = ["brand", "item", "style", "collection"];
//   const Model = models[req.params.type];

//   if (req.body.tags && !Array.isArray(req.body.tags))
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   if (!req.body.content)
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   if (!valid.includes(type))
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   Model.id = req.params.id;
//   const isExist = await Model.find();

//   if (!isExist)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   comment.id = req.params.comment;
//   const isComment = await comment.find();

//   if (!isComment)
//     return res.status(status.NOT_FOUND).json({
//       message: status[status.NOT_FOUND],
//       data: {},
//     });

//   comment.content = req.body.content;
//   comment.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
//   comment.userId = req.user.id;
//   comment.entity = ENTITY;
//   comment.entityId = brand.id;
//   comment.parent = req.params.comment;
//   comment = await comment.save();

//   return res
//     .status(status.CREATED)
//     .json({ message: status[status.CREATED], data: comment });
// });

router.get("/:comment", async (req, res) => {
  comment.id = req.params.comment;
  const cmmt = await comment.find();

  if (!cmmt)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], cmmt });
});

router.get("/:type/all", async (req, res) => {
  const type = req.params.type;
  const valid = ["brand", "item", "style", "collection"];

  if (!valid.includes(type))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const comments = await comment.findMany({
    where: { entity: type.toUpperCase },
  });

  if (!comments.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  res.status(status.OK).json({ message: status[status.OK], comments });
});

router.patch("/:comment", async (req, res) => {
  comment.id = req.params.comment;
  const isComment = await comment.find();

  if (!isComment)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (!req.body.content)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  comment.content = req.body.content;
  comment.userId = req.user.id;
  comment.tags = req.body.tags.map((tag) => transform(tag)) || undefined;
  const created = await comment.save();

  return res.status(status.OK).json({ message: status[status.OK], created });
});

router.delete("/:comment", auth, async (req, res) => {
  comment.id = req.params.comment;
  const isComment = await comment.find();

  if (!isComment)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  await comment.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
