const Mail = require("../utils/Mail");

const mail = new Mail();

module.exports = async (user, template, attr = {}) => {
  const type = {
    welcome: {
      template: mail.WELCOME,
      subject: mail.WELCOME_SUBJECT,
      from: mail.WELCOME_FROM,
    },
  };

  mail.content({
    name: user.name,
    email: user.email,
    subject: type[template].subject,
    from: type[template].from,
    ...attr,
  });

  return await mail.send(type[template].template);
};
