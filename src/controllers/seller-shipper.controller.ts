import { generateTokenWithNoExpiry, verifyActivationToken } from '../utils/handleToken';
import { Users } from '../db/models';
import { AuthenticatedRequest } from '../types/middlewareTypes';
import { Response } from 'express';
import { sendInvitationEmail } from '../utils/sendmail';
import { SellerShippers } from '../db/models';

export const inviteShipper = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let userId = await req.userId;
        let { shipperEmail } = await req.body;
        if (!shipperEmail) {
            return res.sendError(res, "ERR_MISSING_SHIPPER_EMAIL");
        }

        let checkShipper: any = await Users.findOne({
            where: {
                email: shipperEmail,
                type: 'shipper'
            }
        });
        if (!checkShipper) {
            return res.sendError(res, "ERR_SHIPPER_NOT_FOUND");
        }

        let body = {
            sellerId: userId,
            shipperId: checkShipper?.userId
        }

        let token = await generateTokenWithNoExpiry(JSON.stringify(body));

        if (!token.success) {
            return res.sendError(res, "ERR_TOKEN_GENERATE_FAILED");
        }

        const link = `${process.env.ADMIN_URL}/invitation/shipper?token=${token.token}`;
        let result = await sendInvitationEmail(link, checkShipper?.email);

        if (result === true) {
            return res.sendSuccess(res, { message: 'Activation email has been sent successfully' }, 200);
        } else {
            return res.sendError(res, 'Error while sending activation email');
        }

    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export const acceptInvitation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { token }: any = req.query;
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

        let { sellerId, shipperId } = JSON.parse(data);

        let checkSeller: any = await Users.findOne({
            where: {
                userId: shipperId,
                type: 'shipper'
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!checkSeller) {
            return res.sendError(res, "ERR_SHIPPER_NOT_FOUND");
        }

        let checkShipper: any = await Users.findOne({
            where: {
                userId: shipperId,
                type: 'shipper'
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt']
            }
        });
        if (!checkShipper) {
            return res.sendError(res, "ERR_SHIPPER_NOT_FOUND");
        }

        await SellerShippers.create({
            sellerId,
            shipperId
        })

        return res.sendSuccess(res, { message: 'Invitation accepted' }, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}