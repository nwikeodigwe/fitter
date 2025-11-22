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

describe("Comment route", () => {
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
  let endpoint;

  beforeAll(async () => {
    endpoint = "/api/comments";
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

  describe("POST /comment", () => {
    it("should return 400_BAD_REQUEST if not valid model", async () => {
      const res = await request(server)
        .post(`${endpoint}/invalid_model/model_id`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if id does not exist", async () => {
      params = ["brands", "styles", "collections", "items"];
      index = Math.floor(Math.random() * params.length);
      model = models[params[index]];

      jest.spyOn(model, "find").mockResolvedValue(null);

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/invalid_model_id`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 400_BAD_REQUEST if no content", async () => {
      model_id = [brandData.id, styleData.id, collectionData.id, itemData.id];
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header);

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if tag is not an array", async () => {
      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header)
        .send({ content: "comment", tags: "tag" });

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 201_CREATED comment created", async () => {
      model_id = [
        brandData.id,
        styleData.id,
        collectionData.id,
        itemData.id,
        commentData.id,
      ];

      jest.spyOn(model, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(comments, "save").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .post(`${endpoint}/${params[index]}/${model_id[index]}`)
        .set(header)
        .send({
          content: "comment",
          entity: params[index],
          entityId: model_id[index],
          tags: ["tag1", "tag2"],
        });

      expect(model.find).toHaveBeenCalled();
      expect(res.status).toBe(status.CREATED);
    });
  });

  describe("GET /comment", () => {
    it("should return 404_NOT_FOUND if comment not found", async () => {
      const res = await request(server)
        .get(`${endpoint}/invalid_comment_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if comment found", async () => {
      jest
        .spyOn(comments, "find")
        .mockResolvedValue({ id: "valid_comment_id" });

      const res = await request(server)
        .get(`${endpoint}/${commentData.id}`)
        .set(header);

      expect(comments.find).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("GET /comment/:type/all", () => {
    it("should return 400_BAD_REQUEST if type not valid", async () => {
      const res = await request(server)
        .get(`${endpoint}/invalid_type/all`)
        .set(header);

      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 404_NOT_FOUND if no comment found", async () => {
      jest.spyOn(comments, "findMany").mockResolvedValue([]);

      const res = await request(server)
        .get(`${endpoint}/brands/all`)
        .set(header);

      expect(comments.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 200_OK if comment found", async () => {
      jest
        .spyOn(comments, "findMany")
        .mockResolvedValue([{ id: "valid_comment_id" }]);

      const res = await request(server)
        .get(`${endpoint}/brands/all`)
        .set(header);

      expect(comments.findMany).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("PATCH /comment", () => {
    it("should return 404_NOT_FOUND if comment not found", async () => {
      const res = await request(server)
        .patch(`${endpoint}/invalid_comment_id`)
        .set(header);

      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 404_BAD_REQUEST content not provoded", async () => {
      jest
        .spyOn(comments, "find")
        .mockResolvedValue({ id: "valid_comment_id" });

      const res = await request(server)
        .patch(`${endpoint}/${commentData.id}`)
        .set(header);

      expect(comments.find).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if no content", async () => {
      jest.spyOn(comments, "find").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .patch(`${endpoint}/${commentData.id}`)
        .set(header);

      expect(comments.find).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 400_BAD_REQUEST if tag is not an array", async () => {
      jest.spyOn(comments, "find").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .patch(`${endpoint}/${commentData.id}`)
        .set(header)
        .send({ content: "comment", tags: "tag" });

      expect(comments.find).toHaveBeenCalled();
      expect(res.status).toBe(status.BAD_REQUEST);
    });

    it("should return 200_OK comment created", async () => {
      jest.spyOn(comments, "find").mockResolvedValue({ id: "valid_model_id" });
      jest.spyOn(comments, "save").mockResolvedValue({ id: "valid_model_id" });

      const res = await request(server)
        .patch(`${endpoint}/${commentData.id}/`)
        .set(header)
        .send({
          content: "comment",
          tags: ["tag1", "tag2"],
        });

      expect(comments.find).toHaveBeenCalled();
      expect(comments.save).toHaveBeenCalled();
      expect(res.status).toBe(status.OK);
    });
  });

  describe("DELETE /comment", () => {
    it("should return 404_NOT_FOUND if comment not found", async () => {
      jest.spyOn(comments, "find").mockResolvedValue(null);

      const res = await request(server)
        .delete(`${endpoint}/${commentData.id}`)
        .set(header);

      expect(comments.find).toHaveBeenCalled();
      expect(res.status).toBe(status.NOT_FOUND);
    });

    it("should return 204_NO_CONTENT comment deleted", async () => {
      jest
        .spyOn(comments, "find")
        .mockResolvedValue({ id: "valid_comment_id" });
      jest
        .spyOn(comments, "delete")
        .mockResolvedValue({ id: "valid_comment_id" });

      const res = await request(server)
        .delete(`${endpoint}/${commentData.id}`)
        .set(header);

      expect(comments.find).toHaveBeenCalled();
      expect(comments.delete).toHaveBeenCalled();
      expect(res.status).toBe(status.NO_CONTENT);
    });
  });
});
