import { Users } from '../db/models';
import { Request, Response } from 'express';
import { generateToken, generateTokenWithNoExpiry, verifyActivationToken } from '../utils/handleToken';
import { v4 as uuid_v4 } from 'uuid';
import { encryptPassword, verifyPassword } from '../utils/handlePassword';
import { sendActivationEmail, sendForgotPassword } from '../utils/sendmail';
import sequelize from '../db/dbConnect';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const register = async (req: Request, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        let { type, name, email, password } = await req.body;
        if (!email || !password || !type || !name) {
            return res.sendError(res, "ERR_MISSING_FIELDS");
        }
        if (!emailRegex.test(email)) {
            return res.sendError(res, "ERR_INVALID_EMAIL");
        }

        const validTypes = ['seller', 'shipper'];
        if (!validTypes.includes(type)) {
            return res.sendError(res, "ERR_INVALID_USER_TYPE");
        }

        let checkUser = await Users.findOne({
            where: {
                email
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        })
        if (checkUser) {
            return res.sendError(res, "ERR_EMAIL_ALREADY_EXIST");
        }

        const userId = await uuid_v4();
        let securedPassword: any = await encryptPassword(password);
        if (!securedPassword.success) {
            return res.sendError(res, "ERR_PASSWORD_ENCRYPTION_FAILED");
        }

        const user = await Users.create({
            userId,
            type,
            name,
            email,
            password: securedPassword.password,
            verified: false
        },
            { transaction }
        )

        let token = await generateTokenWithNoExpiry(userId);

        if (!token.success) {
            return res.sendError(res, "ERR_TOKEN_GENERATE_FAILED");
        }

        const link = `${process.env.ADMIN_URL}/auth/verification?type=account-activation&token=${token.token}`;
        let result = await sendActivationEmail(link, user?.dataValues?.email);

        if (result === true) {
            await transaction.commit();
            return res.sendSuccess(res, { message: 'Activation email has been sent successfully' }, 200);
        } else {
            await transaction.rollback();
            return res.sendError(res, 'Error while sending activation email');
        }

    } catch (err) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        let { email, password } = await req.body;
        if (!email || !password) {
            return res.sendError(res, "ERR_MISSING_FIELDS");
        }
        if (!emailRegex.test(email)) {
            return res.sendError(res, "ERR_INVALID_EMAIL");
        }

        let checkUser: any = await Users.findOne({
            where: {
                email
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        let isPasswordValid = await verifyPassword(password, checkUser?.password);
        if (!isPasswordValid.verified) {
            return res.sendError(res, "ERR_WRONG_PASSWORD");
        }

        if (!checkUser.verified) {
            return res.sendError(res, "ERR_ACCOUNT_NOT_VERIFIED");
        }

        let accessToken = await generateToken(checkUser?.userId, "access");

        if (!accessToken.success) {
            return res.sendError(res, "ERR_TOKEN_GENERATE_FAILED");
        }

        const cookieMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        res.cookie('token', accessToken.token, {
            httpOnly: true,
            secure: false,
            maxAge: cookieMaxAge,
            sameSite: 'strict'
        });

        let response = {
            id: checkUser?.id,
            userId: checkUser?.userId,
            type: checkUser?.type,
            name: checkUser?.name,
            email: checkUser?.email,
            accessToken: accessToken?.token,
            verified: true,
        }

        return res.sendSuccess(res, response, 200);
    } catch (err) {
        return res.sendError(res, "ERR_INTERNAL_SERVER_ERROR");
    }
}

export const activateAccount = async (req: Request, res: Response) => {
    const { token }: any = req.query;
    try {
        if (!token) {
            return res.sendError(res, "ERR_MISSING_TOKEN");
        }

        const { data, error }: any = await verifyActivationToken(token);

        if (error) {
            switch (error.name) {
                case "JsonWebTokenError":
                    return res.sendError(res, "ERR_INVALID_TOKEN");
                case "TokenExpiredError":
                    return res.sendError(res, "ERR_TOKEN_EXPIRED");
                default:
                    res.sendError(res, "ERR_INVALID_TOKEN");
            }
        }

        let checkUser: any = await Users.findOne({
            where: {
                userId: data.userId,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        if (checkUser.verified) {
            return res.sendError(res, "ERR_ACCOUNT_ALREADY_VERIFIED");
        }

        checkUser.verified = true;
        await checkUser.save();

        let accessToken = await generateToken(checkUser?.userId, "access");

        if (!accessToken.success) {
            return res.sendError(res, "ERR_TOKEN_GENERATE_FAILED");
        }

        const cookieMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        res.cookie('token', accessToken.token, {
            httpOnly: true,
            secure: false,
            maxAge: cookieMaxAge,
            sameSite: 'strict'
        });

        let response = {
            id: checkUser?.id,
            userId: checkUser?.userId,
            type: checkUser?.type,
            name: checkUser?.name,
            email: checkUser?.email,
            accessToken: accessToken?.token,
            verified: true,
        }

        return res.sendSuccess(res, response, 200);

    } catch (error: any) {
        console.log(error)
        res.sendError(res, error?.message);
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        let { email } = await req.body;
        if (!email) {
            return res.sendError(res, "ERR_MISSING_EMAIL");
        }
        if (!emailRegex.test(email)) {
            return res.sendError(res, "ERR_INVALID_EMAIL");
        }

        const user: any = await Users.findOne(
            {
                where: { email }
            }
        );
        if (!user) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }
        if (user?.verified) {
            return res.sendError(res, "ERR_ACCOUNT_ALREADY_VERIFIED");
        }

        let token = await generateTokenWithNoExpiry(user?.userId);

        if (!token.success) {
            return res.sendError(res, "ERR_TOKEN_GENERATE_FAILED");
        }

        const link = `${process.env.ADMIN_URL}/auth/verification?type=reset-password&token=${token.token}`;
        let result = await sendForgotPassword(link, user?.email);

        if (result === true) {
            return res.sendSuccess(res, { message: 'Password reset email has been sent successfully' }, 200);
        } else {
            return res.sendError(res, 'Error while sending forgot password email');
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        let { token, password } = await req.body;
        if (!token || !password) {
            return res.sendError(res, "ERR_MISSING_FIELDS");
        }

        const { data, error }: any = await verifyActivationToken(token);
        if (error) {
            switch (error.name) {
                case "JsonWebTokenError":
                    return res.sendError(res, "ERR_INVALID_TOKEN");
                case "TokenExpiredError":
                    return res.sendError(res, "ERR_TOKEN_EXPIRED");
                default:
                    res.sendError(res, "ERR_INVALID_TOKEN");
            }
        }

        let checkUser: any = await Users.findOne({
            where: {
                userId: data?.userId,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        if (checkUser.verified) {
            return res.sendError(res, "ERR_ACCOUNT_ALREADY_VERIFIED");
        }

        let securedPassword: any = await encryptPassword(password);
        if (!securedPassword.success) {
            return res.sendError(res, "ERR_PASSWORD_ENCRYPTION_FAILED");
        }

        await Users.update({
            password: securedPassword.password,
        }, {
            where: {
                userId: data?.userId
            }
        });
        return res.sendSuccess(res, { status: true, message: 'Password changed successfully' }, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
};