import dotenv from "dotenv";
dotenv.config();
import logger from "./utils/logger";
import scrapper from "./utils/scrapper";
// import crawl from "./crawler";

// const logger = require("./utils/Logger");
// import { crawl } from "./chains/crawler";

async function startCronJob() {
  logger.info("Running test cron job");
  const urls = ["https://www.goat.com/search/?pageLimit=10"];
  // const result = await crawl(urls);
  // console.log(result);

  scrapper.url = ["https://www.goat.com/search"];
  scrapper.selections = ["/get-product-search-results"];
  await scrapper.init();
  await scrapper.run();
}

startCronJob();
