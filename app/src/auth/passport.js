const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
// const LocalStrategy = require("passport-local").Strategy;
const { PrismaClient } = require("@prisma/client");
const config = require("../config/facebook");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// passport.use(
//   new FacebookStrategy(config, async function (
//     accessToken,
//     refreshToken,
//     profile,
//     cb
//   ) {
//     const user = await prisma.user.findOrCreate({
//       where: { email: profile.emails[0].value },
//       defaults: {
//         social: profile.id,
//         username: profile.displayName,
//         email: profile.emails[0].value,
//       },
//     });

//     return cb(null, user);
//   })
// );

// passport.use(
//   new LocalStrategy(
//     { usernameField: "email", passwordField: "password", session: false },
//     async function (email, password, done) {
//       const user = await prisma.user.findUnique({
//         where: {
//           email,
//         },
//       });

//       if (!user) return done(null, false);

//       const passwordMatch = await bcrypt.compare(password, user.password);

//       if (!passwordMatch) return done(null, false);

//       return done(null, user);
//     }
//   )
// );

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//   done(null, obj);
// });
