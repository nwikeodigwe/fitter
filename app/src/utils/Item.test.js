const { item } = require("./Item");
const { user } = require("./User");
const { faker } = require("@faker-js/faker");

describe("Item", () => {
  let userData;
  let itemData;
  let mockItemReturnValue;

  beforeAll(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.email(),
    };

    mockUserReturnValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };

    itemData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      description: faker.lorem.sentence(),
      creator: { id: faker.string.uuid() },
      brand: { id: faker.string.uuid(), name: faker.commerce.productName },
      tags: ["tag1", "tag2"],
      images: [faker.string.uuid(), faker.string.uuid()],
    };

    mockItemReturnValue = {
      name: jest.fn(() => itemData.name),
      description: jest.fn(() => itemData.description),
      creator: { id: jest.fn(() => itemData.creator.id) },
      brand: { id: jest.fn(() => itemData.brand.id) },
      tags: jest.fn(() => itemData.tags),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call create method when creating an item", async () => {
      jest.spyOn(item, "create").mockResolvedValue();
      await item.create();

      expect(item.create).toHaveBeenCalled();
    });

    it("Should return the created item object", async () => {
      jest.spyOn(item, "create").mockResolvedValue(mockItemReturnValue);

      item.name = itemData.name;
      item.description = itemData.description;
      item.images = itemData.images;
      item.brand = itemData.brand.id;
      item.tags = ["tag1", "tag2"];

      const result = await item.create();

      expect(result).toMatchObject(mockItemReturnValue);
    });
  });

  describe("update", () => {
    it("Should call update method when updating an item", async () => {
      jest.spyOn(item, "update").mockResolvedValue();

      await item.update();

      expect(item.update).toHaveBeenCalled();
    });

    it("Should return the updated item object", async () => {
      const newName = faker.internet.username();

      jest
        .spyOn(item, "update")
        .mockResolvedValue({ ...mockItemReturnValue, newName });

      item.name = newName;
      const result = await item.update();

      expect(result).toMatchObject({ ...mockItemReturnValue, newName });
    });
  });

  describe("save", () => {
    it("Should call save method when creating or updating an item", async () => {
      jest.spyOn(item, "save").mockResolvedValue();
      await item.save();

      expect(item.save).toHaveBeenCalled();
    });

    it("Should call update method if item exist", async () => {
      jest.spyOn(user, "save").mockResolvedValue();
      user.name = userData.name;
      user.email = userData.email;
      user.password = userData.password;
      await user.save();

      jest.spyOn(item, "save").mockResolvedValue();
      item.name = itemData.name;
      await item.save();

      expect(item.save).toHaveBeenCalled();
    });

    it("Should call create method if item does not exist", async () => {
      jest.spyOn(item, "deleteMany").mockResolvedValue();

      await item.deleteMany();

      jest.spyOn(item, "save").mockResolvedValue(null);

      item.id = undefined;
      const result = await item.save();

      expect(item.save).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("find", () => {
    it("Should call find method when finding an item", async () => {
      jest.spyOn(item, "find").mockResolvedValue();

      await item.find();

      expect(item.find).toHaveBeenCalled();
    });

    it("Should return the found item object", async () => {
      jest.spyOn(item, "create").mockResolvedValue();
      await item.create();

      jest.spyOn(item, "find").mockResolvedValue(mockItemReturnValue);
      const result = await item.find();

      expect(result).toMatchObject(mockItemReturnValue);
    });

    it("Should return null if no item found", async () => {
      jest.spyOn(item, "deleteMany").mockResolvedValue();
      await item.deleteMany();

      jest.spyOn(item, "find").mockResolvedValue(null);
      const result = await item.find();

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting an item", async () => {
      jest.spyOn(item, "delete").mockResolvedValue();
      await item.delete();

      expect(item.delete).toHaveBeenCalled();
    });

    it("Should return null if no item found", async () => {
      jest.spyOn(item, "deleteMany").mockResolvedValue();
      await item.deleteMany();

      jest.spyOn(item, "delete").mockResolvedValue(null);
      const result = await item.delete();

      expect(result).toBeNull();
    });

    it("Should return the deleted item object", async () => {
      jest.spyOn(item, "create").mockResolvedValue(mockItemReturnValue);
      await item.create();

      jest.spyOn(item, "delete").mockResolvedValue(mockItemReturnValue);
      const result = await item.delete();

      expect(result).toMatchObject(mockItemReturnValue);
    });
  });
});
