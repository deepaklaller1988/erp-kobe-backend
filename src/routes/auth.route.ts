import { activateAccount, forgotPassword, login, register, resetPassword } from "../controllers/auth.controller";
import express from "express";

const router = express();

router.route('/login').post(login);
router.route('/register').post(register);
router.route('/account-activation').get(activateAccount);
router.route('/forgot-password').post(forgotPassword);
router.route('/password-reset').post(resetPassword);

export default router;