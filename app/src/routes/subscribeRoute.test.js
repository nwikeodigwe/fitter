const jwt = require("jsonwebtoken");
const { app } = require("../app");
const { users } = require("../utils/user");
const { brands } = require("../utils/brand");
const { comments } = require("../utils/comment");
const { collections } = require("../utils/collection");
const { styles } = require("../utils/style");
const { items } = require("../utils/item");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");

const request = require("supertest");

let server;

describe("Subscribe route", () => {
  let params;
  let models;
  let model;
  let model_id;
  let header;
  let userData;
  let brandData;
  let endpoint;

  beforeAll(async () => {
    endpoint = "/api/subscribe";
    server = app.listen(0);

    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
    };

    itemData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      creator: userData.id,
      brand: faker.string.uuid(),
      images: [faker.string.uuid(), faker.string.uuid()],
      tags: ["tag1", "tag2"],
    };

    brandData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      owner: userData.id,
      logo: faker.string.uuid(),
      tags: ["tag1", "tag2"],
    };

    commentData = {
      id: faker.string.uuid(),
      content: faker.lorem.sentence(),
      author: userData.id,
      tags: ["tag1", "tag2"],
    };

    mockBrandResolveValue = {
      id: jest.fn(() => brandData.id),
      name: jest.fn(() => brandData.name),
      description: jest.fn(() => brandData.description),
      owner: jest.fn(() => brandData.owner),
      logo: jest.fn(() => brandData.logo),
      tags: jest.fn(() => brandData.tags),
    };

    const token = jwt.sign(
      {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const refresh = jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    mockUserLoginResolveToken = {
      token: refresh,
    };

    jest.spyOn(users, "login").mockResolvedValue(mockUserLoginResolveToken);

    users.email = userData.email;
    users.password = userData.password;
    login = await users.login();

    header = { Authorization: `Bearer ${token}` };

    jest.spyOn(jwt, "verify").mockResolvedValue({
      id: userData.id,
      name: userData.name,
      email: userData.email,
    });

    models = { brands, styles, users, items, collections, comments };
  });

  afterAll(() => {
    params = undefined;
    models = undefined;
    model = undefined;
    model_id = undefined;
    jest.restoreAllMocks();
    server.close();
  });

  describe("POST /subscribe", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .post(`${endpoint}/invalid_model/model_id`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      params = ["brands", "users"];
      index = Math.floor(Math.random() * params.length);

      model = models[params[index]];

      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/invalid_model_id`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if subscribed", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest
        .spyOn(model, "isSubscribed")
        .mockResolvedValue({ id: "valid_model_id" });

      model_id = [brandData.id, userData.id];

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.isSubscribed).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 201_CREATED if subscribe/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "isSubscribed").mockResolvedValue(false);

      jest.spyOn(model, "subscribe").mockResolvedValue(true);

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.isSubscribed).toHaveBeenCalled();
      expect(model.subscribe).toHaveBeenCalled();
      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("DELETE /unsubscribe", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .delete(`${endpoint}/invalid_model/model_id`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`${endpoint}/${params[index]}/invalid_model_id`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if not subsribed", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(model, "isSubscribed").mockResolvedValue(false);

      const res = await request(server)
        .delete(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.isSubscribed).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 204_NO_CONTENT if subscribe/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "isSubscribed").mockResolvedValue(true);

      jest.spyOn(model, "unsubscribe").mockResolvedValue(true);

      const res = await request(server)
        .delete(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(model.isSubscribed).toHaveBeenCalled();
      expect(model.unsubscribe).toHaveBeenCalled();
      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
