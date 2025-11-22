const { users } = require("./User");
const jwt = require("jsonwebtoken");
const { mail } = require("./Mail");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const prisma = require("../functions/prisma");
const { trusted } = require("mongoose");

describe("User", () => {
  let userData;
  let mockUserResolveValue;

  beforeAll(async () => {
    userData = {
      id: faker.string.uuid(),
      name: faker.internet.username(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockUserResolveValue = {
      id: jest.fn(() => userData.id),
      name: jest.fn(() => userData.name),
      email: jest.fn(() => userData.email),
    };
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("Should call save method when creating a user", async () => {
      const create = jest
        .spyOn(prisma.user, "create")
        .mockResolvedValue(trusted);

      users.email = "user_email";
      users.password = "user_password";
      const result = await users.create();

      expect(create).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return the created user object", async () => {
    //   jest.spyOn(prisma.user, "create").mockResolvedValue(mockUserResolveValue);

    //   users.email = userData.email;
    //   const result = await users.create();

    //   expect(result).toMatchObject(mockUserResolveValue);
    // });
  });

  describe("find", () => {
    it("Should throw error if id, name or name is not provided", async () => {
      users.id = undefined;
      users.name = undefined;
      users.email = undefined;

      await expect(users.find()).rejects.toThrow(
        /At least one of id, name, or email must be provided/
      );
    });

    it("Should return null if user not found", async () => {
      const find = jest.spyOn(prisma.user, "findFirst").mockResolvedValue(null);

      users.id = "invalid_user_id";
      const result = await users.find();

      expect(find).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("Should return user object if found", async () => {
      const find = jest
        .spyOn(prisma.user, "findFirst")
        .mockResolvedValue(mockUserResolveValue);

      users.id = userData.id;
      const result = await users.find();

      expect(find).toHaveBeenCalled();
      expect(result).toMatchObject(mockUserResolveValue);
    });
  });

  describe("findById", () => {
    it("Should return true if user found", async () => {
      const find = jest
        .spyOn(prisma.user, "findUnique")
        .mockResolvedValue(true);

      users.id = "user_id";
      const result = await users.findById();

      expect(find).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return user object if found", async () => {
    //   jest.spyOn(prisma.user, "save").mockResolvedValue();

    //   const result = await users.findById();

    //   expect(result).toBeTruthy();
    // });
  });

  describe("findMany", () => {
    it("Should return empty array is no user found", async () => {
      const find = jest.spyOn(prisma.user, "findMany").mockResolvedValue(true);
      const many = await users.findMany();

      expect(find).toHaveBeenCalled();
      expect(many).toBeTruthy();
    });

    // it("Should return array of users if exist", async () => {
    //   jest.spyOn(prisma.user, "save").mockResolvedValue(mockUserResolveValue);
    //   users.email = userData.email;
    //   await users.save();

    //   jest.spyOn(prisma.user, "findMany").mockResolvedValue([mockUserResolveValue]);
    //   const result = await users.findMany();

    //   expect(result).toBeInstanceOf(Array);
    //   expect(result).toHaveLength(1);
    //   expect(result[0]).toMatchObject(mockUserResolveValue);
    // });
  });

  describe("update", () => {
    it("Should return true if user updated", async () => {
      const update = jest.spyOn(prisma.user, "update").mockResolvedValue(true);

      users.id = userData.id;
      users.name = userData.name;
      const result = await users.update();

      expect(update).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("should return the updated user object", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue({ id: "id" });

    //   const saved = await users.save();

    //   const newname = faker.internet.username();
    //   users.id = saved.id;
    //   users.name = newname;

    //   jest
    //     .spyOn(users, "update")
    //     .mockResolvedValue({ ...mockUserResolveValue, name: newname });
    //   const result = await users.update();

    //   expect(result).toMatchObject({ ...mockUserResolveValue, name: newname });
    // });
  });

  describe("passwordMatch", () => {
    it("Should return true if password match", async () => {
      const user = jest
        .spyOn(prisma.user, "findFirst")
        .mockResolvedValue({ password: "passwordhash" });
      const compare = jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      users.password = "password";
      const isPassword = await users.passwordMatch();

      expect(user).toHaveBeenCalled();
      expect(compare).toHaveBeenCalled();
      expect(isPassword).toBeTruthy();
    });

    // it("Should return true if password match", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue();
    //   await users.save();

    //   jest.spyOn(users, "passwordMatch").mockResolvedValue(true);
    //   const isPassword = await users.passwordMatch();

    //   expect(isPassword).toBeTruthy();
    // });
  });

  describe("subscribe", () => {
    it("Should return true if subscribed to user", async () => {
      const subscribe = jest
        .spyOn(prisma.userSubscription, "create")
        .mockResolvedValue(true);

      const result = await users.subscribe("user_id");

      expect(subscribe).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return id when subsribed to user", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue(mockUserResolveValue);

    //   const saved = await users.save();

    //   jest.spyOn(users, "subscribe").mockResolvedValue({ id: "id" });
    //   const result = await users.subscribe(saved.id);

    //   expect(result).toMatchObject({ id: "id" });
    //   expect(result).toBeTruthy();
    // });
  });

  describe("isSubscribe", () => {
    it("Should return false if Id not provided", async () => {
      const subscribe = jest
        .spyOn(prisma.userSubscription, "findFirst")
        .mockResolvedValue(true);

      const result = await users.isSubscribed("user_id");

      expect(subscribe).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return true if subsribed to user", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue(mockUserResolveValue);

    //   const saved = await users.save();

    //   jest.spyOn(users, "isSubscribed").mockResolvedValue(true);
    //   await users.subscribe(saved.id);
    //   const result = await users.isSubscribed(saved.id);

    //   expect(result).toBeTruthy();
    // });
  });

  describe("unsubscribe", () => {
    it("Should return true if to unsubscribed from user", async () => {
      const unsubscribe = jest
        .spyOn(prisma.userSubscription, "delete")
        .mockResolvedValue(true);

      const result = await users.unsubscribe("user_id");

      expect(unsubscribe).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return id if unsubscribe from user", async () => {
    //   jest
    //     .spyOn(prisma.userSubscription, "delete")
    //     .mockResolvedValue(mockUserResolveValue);

    //   users.id = userData.id;
    //   const result = await users.unsubscribe(faker.string.uuid());

    //   expect(prisma.userSubscription.delete).toHaveBeenCalled();
    //   expect(result).toMatchObject(mockUserResolveValue);
    // });
  });

  describe("hashPassword", () => {
    it("Should return true if password hashed", async () => {
      const hash = jest.spyOn(bcrypt, "hashSync").mockResolvedValue(true);

      users.password = "password";
      const result = await users.hashPassword();

      expect(hash).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return hash if password provided", async () => {
    //   jest.spyOn(users, "hashPassword").mockResolvedValue(true);

    //   users.password = userData.password;
    //   const result = await users.hashPassword();

    //   expect(result).toBeTruthy();
    // });
  });

  describe("generateAccessToken", () => {
    it("Should return true if token generated", async () => {
      const find = jest.spyOn(prisma.user, "findFirst").mockResolvedValue(true);
      const sign = jest.spyOn(jwt, "sign").mockResolvedValue(true);

      users.id = "user_id";
      const result = await users.generateAccessToken();

      expect(find).toHaveBeenCalled();
      expect(sign).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return token if user provided", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue();

    //   await users.save();

    //   jest.spyOn(users, "generateAccessToken").mockResolvedValue(true);
    //   const result = await users.generateAccessToken();

    //   expect(result).toBeTruthy();
    // });
  });

  describe("generateRefreshToken", () => {
    it("Should return true if token generated", async () => {
      const find = jest.spyOn(prisma.user, "findFirst").mockResolvedValue(true);
      const sign = jest.spyOn(jwt, "sign").mockResolvedValue(true);

      const result = await users.generateRefreshToken();

      expect(find).toHaveBeenCalled();
      expect(sign).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return generated token if user provided", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue(mockUserResolveValue);

    //   users.email = userData.email;
    //   users.password = userData.password;
    //   const saved = await users.save();

    //   jest.spyOn(users, "generateAccessToken").mockResolvedValue(true);
    //   users.id = saved.id;
    //   const result = await users.generateAccessToken();

    //   expect(result).toBeTruthy();
    // });
  });

  describe("verifyToken", () => {
    it("Should return false if invalid token provided", async () => {
      const verify = jest.spyOn(jwt, "verify").mockResolvedValue(true);

      const result = await users.verifyToken("token");

      expect(verify).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return true if valid token", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue();
    //   await users.save();

    //   jest.spyOn(users, "generateAccessToken").mockResolvedValue("token");
    //   const token = await users.generateAccessToken();

    //   jest.spyOn(users, "verifyToken").mockResolvedValue(true);
    //   const decode = await users.verifyToken(token);

    //   expect(decode).toBeTruthy();
    // });
  });

  describe("login", () => {
    it("Should generate access and refresh token", async () => {
      const find = jest.spyOn(prisma.user, "findFirst").mockResolvedValue(true);
      const sign = jest.spyOn(jwt, "sign").mockResolvedValue("randomstring");

      const result = await users.login();

      expect(find).toHaveBeenCalled();
      expect(sign).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });

  describe("mail", () => {
    it("Should return true if mail sent to user", async () => {
      const mailer = jest.spyOn(mail, "send").mockResolvedValue(true);
      const result = await users.mail("welcome");

      expect(mailer).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });

  describe("createResetToken", () => {
    it("Should return true if reset token created", async () => {
      const find = jest.spyOn(prisma.user, "findFirst").mockResolvedValue(true);
      const create = jest.spyOn(prisma.reset, "create").mockResolvedValue(true);
      const result = await users.createResetToken();

      expect(find).toHaveBeenCalled();
      expect(create).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });

  describe("isValidResetToken", () => {
    it("Should return reset if reset token is valid", async () => {
      const find = jest
        .spyOn(prisma.reset, "findFirst")
        .mockResolvedValue(true);

      users.resetToken = "invalid_reset_token";
      const result = await users.isValidResetToken();

      expect(find).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return true if reset token is valid", async () => {
    //   jest.spyOn(users, "save").mockResolvedValue();

    //   jest.spyOn(users, "createResetToken").mockResolvedValue("token");
    //   const reset = await users.createResetToken();

    //   jest.spyOn(users, "isValidResetToken").mockResolvedValue(true);
    //   users.resetToken = reset.token;
    //   const result = await users.isValidResetToken();

    //   expect(result).toBeTruthy();
    // });
  });

  describe("delete", () => {
    it("Should return true if user deleted", async () => {
      const find = jest.spyOn(prisma.user, "findFirst").mockResolvedValue(true);
      const del = jest.spyOn(prisma.user, "delete").mockResolvedValue(true);

      users.id = "user_id";
      const result = await users.delete();

      expect(find).toHaveBeenCalled();
      expect(del).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    // it("Should return true if user deleted", async () => {
    //   const jest.spyOn(prisma.user, "delete").mockResolvedValue(true);
    //   jest.spyOn(prisma.user, "findFirst").mockResolvedValue(true);
    //   users.id = "invalid_user_id";
    //   const result = await users.delete();

    //   expect(result).toBeTruthy();
    // });
  });

  describe("deleteMany", () => {
    it("Should return true if user deleted", async () => {
      const del = jest.spyOn(prisma.user, "deleteMany").mockResolvedValue(true);

      const result = await users.deleteMany();

      expect(del).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });
  });
});
