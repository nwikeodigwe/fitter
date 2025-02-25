const logger = require("../utils/Logger");
const error = require("./error");
const { status } = require("http-status");

describe("error middleware", () => {
  it("Should log error and send a 500_INTERNAL_SERVER_ERROR response", () => {
    logger.error = jest.fn().mockReturnThis();

    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();
    const err = new Error("Test error");
    logger.error = jest.fn().mockReturnThis(err.message, err);

    error(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(err.message, err);
    expect(res.status).toHaveBeenCalledWith(status.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      message: status[status.INTERNAL_SERVER_ERROR],
      data: {},
    });
  });
});
