const prisma = require("../functions/prisma");
const Comment = require("./Comment");
const { faker } = require("@faker-js/faker");
const Brand = require("./Brand");

describe("Comment", () => {
  let brand;
  let comment;
  let commentData;

  beforeAll(async () => {
    brand = new Brand();
    brand.name = faker.internet.username();
    brand.description = faker.lorem.sentence();
    await brand.save();
    comment = new Comment();

    commentData = {
      id: faker.string.uuid(),
      content: faker.lorem.sentence(),
      entity: "BRAND",
      endtityId: brand.id,
      tags: ["tag1", "tag2"],
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.$transaction([
      prisma.comment.deleteMany(),
      prisma.brand.deleteMany(),
    ]);
  });

  describe("create", () => {
    it("Should call create method when creating a comment", async () => {
      comment.content = commentData.content;
      comment.description = commentData.description;

      mockcreate = jest.spyOn(comment, "create").mockResolvedValue();
      await comment.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });
  });
});
