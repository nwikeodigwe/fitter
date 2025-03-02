const Profile = require("./Profile");
const User = require("./User");
const prisma = require("../functions/prisma");
const { faker } = require("@faker-js/faker");

describe("Profile", () => {
  let profile;
  let user;
  let profileData;

  beforeAll(async () => {
    profile = new Profile();
    profileData = {
      id: faker.string.uuid(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      bio: faker.lorem.sentence(),
    };

    user = new User();
    user.email = faker.internet.email();
    user.password = faker.internet.password();
    await user.save();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await prisma.profile.deleteMany();
  });

  describe("create", () => {
    it("Should call create method when creating a profile", async () => {
      mockcreate = jest.spyOn(profile, "create").mockResolvedValue();
      await profile.create();

      expect(mockcreate).toHaveBeenCalled();
      mockcreate.mockRestore();
    });

    it("Should return the created profile object", async () => {
      profile.firstname = profileData.firstname;
      profile.lastname = profileData.lastname;
      profile.bio = profileData.bio;
      profile.user = user.id;
      const result = await profile.create();

      //   console.log(result);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("firstname", profileData.firstname);
      expect(result).toHaveProperty("lastname", profileData.lastname);
      expect(result).toHaveProperty("bio", profileData.bio);
    });
  });

  describe("update", () => {
    it("Should call update method when updating a profile", async () => {
      mockupdate = jest.spyOn(profile, "update").mockResolvedValue();
      await profile.update();

      expect(mockupdate).toHaveBeenCalled();
      mockupdate.mockRestore();
    });

    it("Should return the updated profile object", async () => {
      const newBio = faker.lorem.sentence();
      profile.bio = newBio;

      const result = await profile.update();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("firstname", profileData.firstname);
      expect(result).toHaveProperty("lastname", profileData.lastname);
      expect(result).toHaveProperty("bio", newBio);
    });
  });

  describe("save", () => {
    it("Should call save method when saving a profile", async () => {
      mocksave = jest.spyOn(profile, "save").mockResolvedValue();
      await profile.save();

      expect(mocksave).toHaveBeenCalled();
      mocksave.mockRestore();
    });

    it("Should call update method if profile exist", async () => {
      const newBio = faker.lorem.sentence();
      profile.bio = newBio;
      const result = await profile.save();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("firstname");
      expect(result).toHaveProperty("lastname");
      expect(result).toHaveProperty("bio", newBio);
    });

    it("Should call create method if profile does not exist", async () => {
      await prisma.profile.deleteMany();

      profile.id = undefined;
      profile.firstname = profileData.firstname;
      profile.lastname = profileData.lastname;
      profile.bio = profileData.bio;
      profile.user = user.id;

      const result = await profile.save();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("firstname", profileData.firstname);
      expect(result).toHaveProperty("lastname", profileData.lastname);
      expect(result).toHaveProperty("bio", profileData.bio);
    });
  });

  describe("find", () => {
    it("Should call find method when finding a profile", async () => {
      mockfind = jest.spyOn(profile, "find").mockResolvedValue();
      await profile.find();

      expect(mockfind).toHaveBeenCalled();
      mockfind.mockRestore();
    });

    it("Should return null if profile not found", async () => {
      await prisma.profile.deleteMany();
      const result = await profile.find();
      expect(result).toBeNull();
    });

    it("Should return the found profile object", async () => {
      await profile.create();
      const result = await profile.find();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("firstname", profileData.firstname);
      expect(result).toHaveProperty("lastname", profileData.lastname);
      expect(result).toHaveProperty("bio", profileData.bio);
    });
  });

  describe("delete", () => {
    it("Should call delete method when deleting a profile", async () => {
      mockdelete = jest.spyOn(profile, "delete").mockResolvedValue();
      await profile.delete();

      expect(mockdelete).toHaveBeenCalled();
      mockdelete.mockRestore();
    });

    it("Should return null if profile not found", async () => {
      await prisma.profile.deleteMany();
      const result = await profile.delete();

      expect(result).toBeNull();
    });

    it("Should return the deleted profile object", async () => {
      await profile.create();
      const result = await profile.delete();

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("firstname", profileData.firstname);
      expect(result).toHaveProperty("lastname", profileData.lastname);
      expect(result).toHaveProperty("bio", profileData.bio);
    });
  });
});
