const cron = require("node-cron");
const logger = require("./utils/Logger");
const scrapper = require("./utils/Scrapper");

cron.schedule("*/5 * * * *", async () => {
  logger.info("Running cron job every 5 minutes");
  scrapper.url = ["https://goat.com"];
  scrapper.selections = [
    { element: "img", attribute: "src" },
    { element: "a", attribute: "href" },
  ];
  await scrapper.run();
});
