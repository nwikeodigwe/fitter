const { items } = require("./item");
const prisma = require("../functions/prisma");
const { faker } = require("@faker-js/faker");

describe("Item", () => {
  let itemData;
  let mockItemReturnValue;

  beforeAll(async () => {
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
      const create = jest
        .spyOn(prisma.item, "create")
        .mockResolvedValue(mockItemReturnValue);
      await items.create();

      expect(create).toHaveBeenCalled();
    });

    it("Should return the created item object", async () => {
      jest.spyOn(prisma.item, "create").mockResolvedValue(mockItemReturnValue);

      items.name = itemData.name;
      items.description = itemData.description;
      items.images = itemData.images;
      items.brand = itemData.brand.id;
      items.tags = ["tag1", "tag2"];

      const result = await items.create();

      expect(result).toMatchObject(mockItemReturnValue);
    });
  });

  describe("update", () => {
    it("Should call update method when updating an item", async () => {
      const update = jest.spyOn(prisma.item, "update").mockResolvedValue();

      await items.update();

      expect(update).toHaveBeenCalled();
    });

    it("Should return the updated item object", async () => {
      const newName = faker.internet.username();

      jest
        .spyOn(prisma.item, "update")
        .mockResolvedValue({ ...mockItemReturnValue, newName });

      items.name = newName;
      const result = await items.update();

      expect(prisma.item.update).toHaveBeenCalled();
      expect(result).toMatchObject({ ...mockItemReturnValue, newName });
    });
  });

  describe("save", () => {
    it("Should call create method when creating or updating an item", async () => {
      const create = jest
        .spyOn(prisma.item, "create")
        .mockResolvedValue(mockItemReturnValue);
      await items.save();

      expect(create).toHaveBeenCalled();
    });

    it("Should call update method if item exist", async () => {
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.item, "update").mockResolvedValue(mockItemReturnValue);

      items.name = itemData.name;
      await items.save();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(prisma.item.update).toHaveBeenCalled();
    });

    it("Should call create method if item does not exist", async () => {
      jest.spyOn(prisma.item, "create").mockResolvedValue(mockItemReturnValue);
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue(null);

      items.id = undefined;
      await items.save();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(prisma.item.create).toHaveBeenCalled();
    });
  });

  describe("find", () => {
    it("Should call find method when finding an item", async () => {
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue();

      await items.find();

      expect(prisma.item.findFirst).toHaveBeenCalled();
    });

    it("Should return the found item object", async () => {
      jest
        .spyOn(prisma.item, "findFirst")
        .mockResolvedValue(mockItemReturnValue);
      const result = await items.find();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(result).toMatchObject(mockItemReturnValue);
    });

    it("Should return null if no item found", async () => {
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue(null);
      const result = await items.find();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting an item", async () => {
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.item, "delete").mockResolvedValue();
      await items.delete();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(prisma.item.delete).toHaveBeenCalled();
    });

    it("Should return null if no item found", async () => {
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue(null);
      const result = await items.delete();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(result).toBeFalsy();
    });

    it("Should return the deleted item object", async () => {
      jest.spyOn(prisma.item, "findFirst").mockResolvedValue(true);
      jest.spyOn(prisma.item, "delete").mockResolvedValue(mockItemReturnValue);
      const result = await items.delete();

      expect(prisma.item.findFirst).toHaveBeenCalled();
      expect(result).toMatchObject(mockItemReturnValue);
    });
  });
});
