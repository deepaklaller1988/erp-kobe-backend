// import accessControl from "../middlewares/access-control";
import { activateAccount, forgotPassword, login, logout, register, resetPassword, verifyPasswordResetLink } from "../controllers/auth.controller";
import express from "express";

const router = express();

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/logout').get(logout);
router.route('/account-activation').get(activateAccount);
router.route('/forgot-password').post(forgotPassword);
router.route('/password-reset').post(resetPassword);
router.route('/verify-password-reset-link').get(verifyPasswordResetLink);

export default router;