require("dotenv").config();
const auth = require("./auth");
const jwt = require("jsonwebtoken");
const { status } = require("http-status");
const { faker } = require("@faker-js/faker");

jest.mock("jsonwebtoken");

describe("Auth middleware", () => {
  let user;
  let token;
  let req;
  let res;
  let next;

  beforeEach(() => {
    user = {
      id: 123,
      name: faker.internet.username(),
      email: faker.internet.email(),
    };

    token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });

    req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });
  it("Should return 401_FORBIDDEN if no token is provided", () => {
    const req = {
      headers: {},
    };
    const next = jest.fn();

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(status.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      error: status[status.UNAUTHORIZED],
    });
  });

  it("Should return 403_FORBIDDEN if token is invalid", () => {
    req = {
      headers: {
        authorization: "Bearer invalidtoken",
      },
    };

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(status.FORBIDDEN);
  });

  it("Should populate req.user with the payload of a valid JWT", () => {
    res = {};
    jwt.verify.mockReturnValue(user);

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user).toMatchObject(user);
    expect(next).toHaveBeenCalled();
  });
});
