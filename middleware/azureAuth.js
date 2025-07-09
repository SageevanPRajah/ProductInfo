import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { User } from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../controllers/userController.js'; // reuse your JWT helper

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const opts = {
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  clientID: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: process.env.AZURE_REDIRECT_URI,
  allowHttpForRedirectUrl: true,            // ← allow non-HTTPS on localhost
  scope:                  ['openid','profile','offline_access'],
  loggingLevel:          'info',
};

passport.use(new OIDCStrategy(opts,
  async (iss, sub, profile, done) => {
    try {
      // 1️⃣ Find or create local user by email
      const email = profile._json.preferred_username;
      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name: profile.displayName,
          email,
          role: 'Viewer',
          // generate a random temp password so your pre-save hook hashes it
          hashed_password: Math.random().toString(36).slice(-8)
        });
        await user.save();
      }
      // 2️⃣ Issue your JWT
      const token = generateToken(user);
      return done(null, { user, token });
    } catch(err) {
      return done(err, null);
    }
  }
));

export default passport;
