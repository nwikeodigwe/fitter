// logger.test.js
const logger = require("./Logger");

describe("Logger", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe("info method", () => {
    it("should call the underlying winston.info method", () => {
      const spy = jest.spyOn(logger.logger, "info");
      const message = "Test info message";
      const meta = { key: "value" };

      logger.info(message, meta);

      expect(spy).toHaveBeenCalledWith(message, meta);
    });
  });

  describe("error method", () => {
    it("should call the underlying winston.error method", () => {
      const spy = jest.spyOn(logger.logger, "error");
      const message = "Test error message";
      const meta = { error: true };

      logger.error(message, meta);

      expect(spy).toHaveBeenCalledWith(message, meta);
    });
  });

  describe("warn method", () => {
    it("should call the underlying winston.warn method", () => {
      const spy = jest.spyOn(logger.logger, "warn");
      const message = "Test warn message";
      const meta = { warning: true };

      logger.warn(message, meta);

      expect(spy).toHaveBeenCalledWith(message, meta);
    });
  });

  describe("debug method", () => {
    it("should call the underlying winston.debug method", () => {
      const spy = jest.spyOn(logger.logger, "debug");
      const message = "Test debug message";
      const meta = { debug: true };

      logger.debug(message, meta);

      expect(spy).toHaveBeenCalledWith(message, meta);
    });
  });
});
