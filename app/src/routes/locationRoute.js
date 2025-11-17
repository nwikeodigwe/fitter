const express = require("express");
const { status } = require("http-status");
const router = express.Router();

router.get("/country", async (req, res) => {
  const getClientIp = (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.connection.remoteAddress || null;
  };

  const ip = getClientIp(req);
  if (!ip)
    return res
      .status(status.BAD_REQUEST)
      .json({ error: true, message: status[status.BAD_REQUEST] });

  const geo = await fetch(
    `https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!geo.ok)
    return res
      .status(status.BAD_REQUEST)
      .json({ message: status[status.BAD_REQUEST], error: true });

  const data = await geo.json();
  console.log(data);
  return res.status(status.OK).json({ message: status[status.OK], data });
});

module.exports = router;
