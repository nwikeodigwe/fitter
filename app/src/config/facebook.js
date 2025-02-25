module.exports = {
  clientID: process.env.FACEBOOK_ClIENT_ID,
  clientSecret: process.env.FACEBOOK_ClIENT_SECRET,
  callbackURL: "http://localhost:8000/auth/facebook/callback",
};
