const express = require("express");
const { brand } = require("../utils/Brand");
const { user } = require("../utils/User");
const { comment } = require("../utils/Comment");
const { status } = require("http-status");
const auth = require("../middleware/auth");
const router = express.Router();

const ENTITY = "BRAND";

router.post("/", auth, async (req, res) => {
  if (!req.body.name || !req.body.description)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  brand.name = req.body.name
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, " ");

  brand.owner = req.body.owner ? req.body.owner : req.user.id;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], data: {} });

  if (req.body.tags && req.body.tags.length > 0)
    brand.tags = req.body.tags.map((tag) =>
      tag
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ")
    );

  brand.logo = req.body.logo ? req.body.logo : undefined;

  const isBrand = await brand.find();

  if (isBrand)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const isUser = await user.find({
    id: brand.owner,
  });

  if (!isUser) brand.owner = req.user.id;

  brand.description = req.body.description;

  const response = await brand.save();

  return res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

router.get("/", async (req, res) => {
  const brands = await brand.findMany();

  if (!brands.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], brands });
});

router.get("/tags", async (req, res) => {
  const tags = await brand.getTags();

  if (!tags.length)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  return res.status(status.OK).json({ message: status[status.OK], tags });
});

router.get("/popular", async (req, res) => {
  const brands = await brand.findMany();

  return res
    .status(status.OK)
    .json({ message: status[status.OK], data: brands });
});

router.get("/:brand", async (req, res) => {
  brand.id = req.params.brand;
  const response = await brand.find();

  if (!response)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], data: {} });

  return res.status(status.OK).json({ message: status[status.OK], brand });
});

router.patch("/:brand", auth, async (req, res) => {
  brand.id = req.params.brand;
  const isBrand = await brand.find();

  if (!isBrand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  brand.owner = req.user.id;

  brand.name = req.body.name
    ? req.body.name
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, " ")
    : null;

  if (req.body.tags && !Array.isArray(req.body.tags))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  brand.tags = req.body.tags
    ? req.body.tags.map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, " ")
      )
    : null;

  const response = await brand.save();

  return res.status(status.OK).json({ message: status[status.OK], response });
});

// router.put("/:brand/upvote", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrandExists = await brand.find();

//   if (!isBrandExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], data: {} });

//   const response = await brand.upvote(req.user.id);

//   return res.status(status.OK).json({ message: status[status.OK], response });
// });

// router.put("/:brand/downvote", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrand = await brand.find();

//   if (!isBrand)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   const response = await brand.downvote(req.user.id);

//   return res.status(status.OK).json({ message: status[status.OK], response });
// });

// router.delete("/:brand/unvote", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrand = await brand.find();

//   if (!isBrand)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   const isVoted = await brand.isVoted(req.user.id);

//   if (!isVoted)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   await brand.unvote(req.user.id);

//   return res.status(status.NO_CONTENT).end();
// });

// router.post("/:brand/subscribe", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrand = await brand.find();

//   if (!isBrand)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   const isSubscribed = await brand.isSubscribed(req.user.id);

//   if (isSubscribed)
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   const response = await brand.subscribe(req.user.id);

//   res
//     .status(status.CREATED)
//     .json({ message: status[status.CREATED], data: response });
// });

// router.delete("/:brand/unsubscribe", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrand = await brand.find();

//   if (!isBrand)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   const isSubscribed = await brand.isSubscribed(req.user.id);

//   if (!isSubscribed)
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   await brand.unsubscribe(req.user.id);

//   return res.status(status.NO_CONTENT).end();
// });

// router.post("/:brand/comment", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrand = await brand.find();

//   if (!isBrand)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   if (!req.body.content)
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   if (req.body.tags && !Array.isArray(req.body.tags))
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   let commentData = {
//     content: req.body.content,
//     userId: req.user.id,
//     entity: ENTITY,
//     entityId: brand.id,
//   };

//   commentData.tags = req.body.tags.map((tag) =>
//     tag
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-zA-Z0-9]/g, " ")
//   );

//   const created = await comment.save(commentData);

//   return res
//     .status(status.CREATED)
//     .json({ message: status[status.CREATED], created });
// });

// router.post("/:brand/comment/:comment", auth, async (req, res) => {
//   if (!req.body.content)
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   if (req.body.tags && !Array.isArray(req.body.tags))
//     return res
//       .status(status.BAD_REQUEST)
//       .json({ message: status[status.BAD_REQUEST], error: true });

//   brand.id = req.params.brand;
//   const isBrand = await brand.find();

//   if (!isBrand)
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
//   comment.tags =
//     req.body.tags.map((tag) =>
//       tag
//         .trim()
//         .toLowerCase()
//         .replace(/[^a-zA-Z0-9]/g, " ")
//     ) || undefined;
//   comment.userId = req.user.id;
//   comment.entity = ENTITY;
//   comment.entityId = brand.id;
//   comment.parent = req.params.comment;
//   comment = await comment.create();

//   return res
//     .status(status.CREATED)
//     .json({ message: status[status.CREATED], comment });
// });

// router.get("/:brand/comments", auth, async (req, res) => {
//   brand.id = req.params.brand;
//   const isBrandExists = await brand.find();

//   if (!isBrandExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   const comments = await comments.findMany({ entityId: req.params.brand });

//   res.status(status.OK).json({ message: status[status.OK], data: comments });
// });

// router.delete("/comment/:comment", auth, async (req, res) => {
//   comment.id = req.params.comment;
//   const isCommentExists = await comment.find();

//   if (!isCommentExists)
//     return res
//       .status(status.NOT_FOUND)
//       .json({ message: status[status.NOT_FOUND], error: true });

//   await comment.delete();

//   return res.status(status.NO_CONTENT).end();
// });

router.delete("/:brand", auth, async (req, res) => {
  brand.id = req.params.brand;
  const isBrand = await brand.find();

  if (!isBrand)
    return res
      .status(status.NOT_FOUND)
      .json({ message: status[status.NOT_FOUND], error: true });

  if (isBrand.owner.id === req.user.id) await brand.delete();

  return res.status(status.NO_CONTENT).end();
});

module.exports = router;
