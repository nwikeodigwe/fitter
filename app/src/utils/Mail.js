const { resend } = require("../startup/resend");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { logger } = require("./Logger");

class Mail {
  constructor() {
    this.from = process.env.EMAIL_USER;
    this.WELCOME = "welcome";
    this.WELCOME_SUBJECT = "Welcome to Fitter App";
    this.WELCOME_FROM = "Acme <onboarding@resend.dev>";
  }

  template(templateName = "welcome", context = {}) {
    logger.info("Getting email template");
    this.templateName = templateName;
    const filePath = path.join(
      __dirname,
      "../emails",
      `${this.templateName}.hbs`
    );
    const source = fs.readFileSync(filePath, "utf-8").toString();
    const tmp = handlebars.compile(source);
    return tmp(context);
  }

  content(htmlContent) {
    logger.info("Adding html content...");
    this.htmlContent = htmlContent;
    this.to = htmlContent.email;
    this.subject = htmlContent.subject;
    this.from = htmlContent.from || this.from;
    this.attr = htmlContent.attr || {};
  }

  async send(emailTemplate) {
    logger.info("Sending email");
    return resend.emails.send({
      from: this.from,
      to: this.to,
      subject: this.subject,
      html: this.template(emailTemplate, {
        ...this.htmlContent,
        ...this.attr,
      }),
    });
  }
}

const mail = new Mail();
module.exports = { mail, Mail };
