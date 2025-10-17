const jwt = require("jsonwebtoken");
const { app } = require("../app");
const { user } = require("../utils/User");
const { brand } = require("../utils/Brand");
const { comment } = require("../utils/Comment");
const { collection } = require("../utils/Collection");
const { style } = require("../utils/Style");
const { item } = require("../utils/Item");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");

const request = require("supertest");

let server;

describe("Action route", () => {
  let params;
  let models;
  let model;
  let model_id;
  let header;
  let userData;
  let itemData;
  let styleData;
  let collectionData;
  let brandData;

  beforeAll(async () => {
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

    styleData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      collection: faker.string.uuid(),
      creator: userData.id,
      brand: faker.string.uuid(),
      images: [faker.string.uuid(), faker.string.uuid()],
      tags: ["tag1", "tag2"],
    };

    collectionData = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      owner: userData.id,
      logo: faker.string.uuid(),
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

    jest.spyOn(user, "login").mockResolvedValue(mockUserLoginResolveToken);

    user.email = userData.email;
    user.password = userData.password;
    login = await user.login();

    header = { Authorization: `Bearer ${token}` };

    jest.spyOn(jwt, "verify").mockResolvedValue({
      id: userData.id,
      name: userData.name,
      email: userData.email,
    });

    models = { brand, style, user, item, collection, comment };
  });

  afterAll(() => {
    params = undefined;
    models = undefined;
    model = undefined;
    model_id = undefined;
    jest.restoreAllMocks();
    server.close();
  });

  describe("PUT /upvote", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .put("/api/upvote/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      params = ["brand", "style", "collection", "item", "comment"];
      index = Math.floor(Math.random() * params.length);
      model = models[params[index]];

      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .put(`/api/upvote/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK brand/style upvoted", async () => {
      model_id = [
        brandData.id,
        styleData.id,
        collectionData.id,
        itemData.id,
        commentData.id,
      ];

      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(model, "upvote").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .put(`/api/upvote/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("PUT /downvote", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .put("/api/downvote/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      const res = await request(server)
        .put(`/api/downvote/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if downvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "downvote").mockResolvedValue(mockBrandResolveValue);

      const res = await request(server)
        .put(`/api/downvote/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /unvote", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .delete("/api/unvote/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`/api/unvote/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if not voted", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(model, "isVoted").mockResolvedValue(null);

      const res = await request(server)
        .delete(`/api/unvote/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 204_NO_CONTENT if brand/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "isVoted").mockResolvedValue(true);

      jest.spyOn(model, "unvote").mockResolvedValue(true);

      const res = await request(server)
        .delete(`/api/unvote/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("POST /subscribe", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .post("/api/subscribe/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      params = ["brand", "user"];
      index = Math.floor(Math.random() * params.length);

      model = models[params[index]];

      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`/api/subscribe/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if subscribed", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest
        .spyOn(model, "isSubscribed")
        .mockResolvedValue({ id: "valid_model_id" });

      model_id = [brandData.id, userData.id];

      const res = await request(server)
        .post(`/api/subscribe/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 201_CREATED if subscribe/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "isSubscribed").mockResolvedValue(false);

      jest.spyOn(model, "subscribe").mockResolvedValue(true);

      const res = await request(server)
        .post(`/api/subscribe/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("DELETE /unsubscribe", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .delete("/api/unsubscribe/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`/api/unsubscribe/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if not subsribed", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(model, "isSubscribed").mockResolvedValue(false);

      const res = await request(server)
        .delete(`/api/unsubscribe/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 204_NO_CONTENT if subscribe/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "isSubscribed").mockResolvedValue(true);

      jest.spyOn(model, "unsubscribe").mockResolvedValue(true);

      const res = await request(server)
        .delete(`/api/unsubscribe/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });

  describe("POST /favorite", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .post("/api/favorite/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      params = ["brand", "style", "item", "collection"];
      index = Math.floor(Math.random() * params.length);

      model = models[params[index]];

      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`/api/favorite/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 201_CREATED if subscribe/item unvoted", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "favorite").mockResolvedValue(true);

      const res = await request(server)
        .post(`/api/favorite/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("DELETE /unfavorite", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .delete("/api/unfavorite/invalid_model/model_id")
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`/api/unfavorite/${params[index]}/invalid_model_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_NOT_FOUND if not favorited", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(model, "isFavorite").mockResolvedValue(false);

      const res = await request(server)
        .delete(`/api/unfavorite/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 204_NO_CONTENT if subscribe/item unfavorited", async () => {
      jest.spyOn(model, "find").mockResolvedValue(mockBrandResolveValue);

      jest.spyOn(model, "isFavorite").mockResolvedValue(true);

      jest.spyOn(model, "unfavorite").mockResolvedValue(true);

      const res = await request(server)
        .delete(`/api/unfavorite/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
