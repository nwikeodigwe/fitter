const prisma = require("../functions/prisma");
const Item = require("./Item");
const User = require("./User");
const Brand = require("./Brand");
const Image = require("./Image");
const { faker, de } = require("@faker-js/faker");

describe("Item", () => {
  let item;
  let user;
  let brand;
  let image;
  let itemData;
  beforeAll(async () => {
    item = new Item();
    itemData = {
      name: faker.internet.username(),
      description: faker.lorem.sentence(),
    };

    user = new User();
    user.email = faker.internet.email();
    user.password = faker.internet.password();
    await user.save();

    brand = new Brand();
    brand.name = faker.internet.username();
    brand.description = faker.lorem.sentence();
    await brand.save();

    image = new Image();
    image.url = faker.internet.url();
    await image.save();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.item.deleteMany();
  });

  describe("create", () => {
    it("Should call create method when creating an item", async () => {
      mockcreate = jest.spyOn(item, "create").mockResolvedValue();
      await item.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created item object", async () => {
      item.name = itemData.name;
      item.description = itemData.description;
      item.images = [image.id];
      item.brand = brand.id;
      item.creator = user.id;
      item.tags = ["tag1", "tag2"];
      const result = await item.create();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", itemData.name);
      expect(result).toHaveProperty("description", itemData.description);
    });
  });

  describe("update", () => {
    it("Should call update method when updating an item", async () => {
      mockupdate = jest.spyOn(item, "update").mockResolvedValue();
      await item.update();

      expect(mockupdate).toHaveBeenCalled();
      mockupdate.mockRestore();
    });

    it("Should return the updated item object", async () => {
      const newName = faker.internet.username();
      item.name = newName;
      const result = await item.update();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name", newName);
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating an item", async () => {
      mocksave = jest.spyOn(item, "save").mockResolvedValue();
      await item.save();

      expect(mocksave).toHaveBeenCalled();
      mocksave.mockRestore();
    });

    it("Should call update method if item exist", async () => {
      mockupdate = jest.spyOn(item, "update").mockResolvedValue();
      await item.save();

      expect(mockupdate).toHaveBeenCalled();
      mockupdate.mockRestore();
    });

    it("Should call create method if item does not exist", async () => {
      await prisma.item.deleteMany();
      item.id = undefined;
      mockcreate = jest.spyOn(item, "create").mockResolvedValue();
      await item.save();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });
  });

  describe("find", () => {
    it("Should call find method when finding an item", async () => {
      mockfind = jest.spyOn(item, "find").mockResolvedValue();
      await item.find();

      expect(mockfind).toHaveBeenCalled();
      mockfind.mockRestore();
    });

    it("Should return the found item object", async () => {
      await item.create();
      const result = await item.find();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("description");
    });

    it("Should return null if no item found", async () => {
      await prisma.item.deleteMany();
      const result = await item.find();

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting an item", async () => {
      mockdelete = jest.spyOn(item, "delete").mockResolvedValue();
      await item.delete();

      expect(mockdelete).toHaveBeenCalled();
      mockdelete.mockRestore();
    });

    it("Should return null if no item found", async () => {
      await prisma.item.deleteMany();
      const result = await item.delete();

      expect(result).toBeNull();
    });

    it("Should return the deleted item object", async () => {
      await item.create();
      const result = await item.delete();

      expect(result).toHaveProperty("id");
    });
  });
});
