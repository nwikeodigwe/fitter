const { request, chromium } = require("playwright-extra");
const stealth = require("puppeteer-extra-plugin-stealth");

const cheerio = require("cheerio");
const logger = require("./Logger");
const { Item } = require("./Item");

class Scrapper {
  #data = [];
  #browser = null;
  #context = null;
  #field = [];
  constructor(url) {
    this.url = url;
    this.selections = [];
    chromium.use(stealth());
  }

  async init() {
    this.#browser = await chromium.launch({
      headless: false,
    });
    this.#context = await this.#browser.newContext();
    return this;
  }

  async #fetch() {
    for (const link of this.url) {
      try {
        const page = await this.#context.newPage();

        await page.on("response", async (res) => {
          if (
            this.selections.some((selection) => res.url().includes(selection))
          ) {
            try {
              const json = await res.json();
              this.#data.push(...json.data.productsList);
            } catch (err) {
              logger.error("Failed to parse JSON from:", res.url(), err);
            }
          }
        });

        await page.on("framenavigated", (frame) => logger.info(frame.url()));

        await page.goto(link, { waitUntil: "networkidle" });

        await page.close();
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }
    return this;
  }

  async #parse() {
    const items = [];
    for (const parsed of this.#data) {
      const isItem = await Item.findBySlug(parsed.slug);

      const tags = [
        parsed.productType,
        parsed.brandName,
        parsed.seasonYear,
        parsed.silhouette,
        parsed.brandName,
        parsed.category,
        ...parsed.activitiesList,
      ]
        .filter((tag) => tag?.trim())
        .filter((tag, index, self) => self.indexOf(tag) === index);

      const item = new Item({
        name: parsed.title,
        slug: parsed.slug,
        brand: parsed.brandName,
        category: parsed.category,
        images: [parsed.pictureUrl],
        tags: tags,
      });

      if (!isItem) await item.save();
    }
  }

  async #goat(page) {
    // logger.info(page);
    const $ = cheerio.load(page);
    const script = $("#__NEXT_DATA__").html();
    const json = JSON.parse(script);
    const sections = json.props.pageProps.discoverTabFeed.sections;
    const items = [];
    for (const section of sections) {
      const response = section.constructorResponse.response.results;

      // console.log(response);
      for (const res of response) {
        logger.info(res.slug);
        // const isItem = item.findBySlug(res.slug);
        // if (!isItem)
        //   items.push({
        //     name: res.title,
        //     slug: res.slug,
        //     category: res.category,
        //     releaseYear: res.releaseYear,
        //     images: [res.pictureUrl],
        //     tags: [
        //       section.title ?? section.subtitle ?? undefined,
        //       res.seasonYear,
        //     ],
        //   });
      }
    }
    // console.log(items);
    // await item.createMany(items);
  }

  async run() {
    await this.#fetch();
    // await this.#parse();
    return this;
  }
}

const scrapper = new Scrapper();
module.exports = scrapper;
