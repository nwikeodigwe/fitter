// mail.test.js
const fs = require("fs");
const mail = require("./Mail");
const { faker, fa } = require("@faker-js/faker");

describe("Mail Class", () => {
  let contentData;
  beforeEach(() => {
    jest.resetModules();

    contentData = {
      email: faker.internet.email(),
      subject: "Test Subject",
      from: `Sender <${faker.internet.email()}>`,
      attr: { extra: "data" },
    };
  });

  describe("template()", () => {
    it("should compile the handlebars template with provided context", () => {
      const fakeTemplate = "Hello, {{name}}!";
      const readFileSpy = jest
        .spyOn(fs, "readFileSync")
        .mockReturnValue(fakeTemplate);

      const context = { name: "John" };
      const output = mail.template("welcome", context);

      expect(output).toBe("Hello, John!");
      expect(readFileSpy).toHaveBeenCalled();

      readFileSpy.mockRestore();
    });
  });

  describe("content()", () => {
    it("should set htmlContent, to, subject, from, and attr properties", () => {
      mail.content(contentData);

      expect(mail.htmlContent).toEqual(contentData);
      expect(mail.to).toBe(contentData.email);
      expect(mail.subject).toBe(contentData.subject);
      expect(mail.from).toBe(contentData.from);
      expect(mail.attr).toEqual(contentData.attr);
    });
  });

  describe("send()", () => {
    it("should call resend.emails.send with the correct parameters", async () => {
      mail.content(contentData);

      const templateSpy = jest
        .spyOn(mail, "template")
        .mockReturnValue("compiled-html");

      mail.resend = {
        emails: {
          send: jest.fn().mockResolvedValue({ success: true }),
        },
      };

      const result = await mail.send("welcome");

      expect(templateSpy).toHaveBeenCalledWith("welcome", {
        ...mail.htmlContent,
        ...mail.attr,
      });

      expect(mail.resend.emails.send).toHaveBeenCalledWith({
        from: mail.from,
        to: mail.to,
        subject: mail.subject,
        html: "compiled-html",
      });
      expect(result).toEqual({ success: true });

      templateSpy.mockRestore();
    });
  });
});
