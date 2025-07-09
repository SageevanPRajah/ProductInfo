// backend/routes/authAzureRoute.js
import express from 'express';
import passport from '../middleware/azureAuth.js';

const router = express.Router();

// 1) Kick off the Azure sign-in flow
router.get(
  '/azure',
  passport.authenticate('azuread-openidconnect', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=azure_start_fail`
  })
);

// 2) Handle Azure’s form_post callback
router.post(
  '/azure/callback',
  passport.authenticate('azuread-openidconnect', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=azure_fail`,
    //session: false
  }),
  (req, res) => {
    // passport sets req.user = { user, token }
    const { token } = req.user;
    // Redirect the SPA with the JWT in the query string
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/azure/callback?token=${token}`
    );
  }
);

export default router;
