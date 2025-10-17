const express = require("express");
const newsletter = require("../utils/Newsletter");
const { status } = require("http-status");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.email)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email))
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const isExisting = await newsletter.findByEmail(req.body.email);
  if (isExisting)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Email already subscribed", error: true });

  const response = await newsletter.save(req.body.email);

  res
    .status(status.CREATED)
    .json({ message: status[status.CREATED], response });
});

module.exports = router;
