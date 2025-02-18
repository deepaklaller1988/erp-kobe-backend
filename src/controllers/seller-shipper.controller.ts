import { generateTokenWithNoExpiry, verifyActivationToken } from '../utils/handleToken';
import { Orders, Products, Users } from '../db/models';
import { AuthenticatedRequest } from '../types/middlewareTypes';
import { Response } from 'express';
import { sendInvitationEmail } from '../utils/sendmail';
import { SellerShippers } from '../db/models';
import sequelize from '../db/dbConnect';
import { QueryTypes } from 'sequelize';

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

        if (!checkShipper.verified) {
            return res.sendError(res, "ERR_SHIPPER_NOT_VERIFIED");
        }

        let checkAssociation = await SellerShippers.findOne({
            where: {
                sellerId: userId,
                shipperId: checkShipper?.userId
            }
        });
        if(checkAssociation){
            return res.sendError(res, "ERR_SHIPPER_ALREADY_INVITED");
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

        let { sellerId, shipperId } = JSON.parse(data.userId);

        console.log(data, sellerId, shipperId, 'popopopopop')

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

        let checkIfAssociationAlreadyExists = await SellerShippers.findOne({
            where: {
                sellerId,
                shipperId
            }
        })
        if (checkIfAssociationAlreadyExists) {
            return res.sendError(res, "ERR_INVITATION_ALREADY_ACCEPTED");
        }

        await SellerShippers.create({
            sellerId,
            shipperId
        })

        return res.sendSuccess(res, { message: 'Invitation accepted' }, 200);
    } catch (error: any) {
        console.log(error)
        return res.sendError(res, error.message);
    }
}

export const allOrdersOfaSellerShipper = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let sellerId: any = req.query.sellerId;
        if (!sellerId) {
            return res.sendError(res, "ERR_MISSING_SELLER_ID");
        }
        let checkUser = await Users.findOne({
            where: {
                userId: sellerId
            }
        })
        if (!checkUser) {
            return res.sendError(res, "ERR_SELLER_NOT_FOUND");
        }

        let orders = await Orders.findAndCountAll({
            where: {
                sellerId
            },
            include: [Products],
            offset: offset,
            limit: limit,
            order: [
                ["id", "DESC"]
            ]
        });

        return res.sendSuccess(res, orders, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export const getAllSellerOfaShipper = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const userId = req.userId;

        if (!userId) {
            return res.sendError(res, "ERR_MISSING_SHIPPER_ID");
        }

        const checkShipper = await Users.findOne({
            where: {
                userId
            }
        });

        if (!checkShipper) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        const query = `
            SELECT 
                ss.id AS seller_shipper_id,
                ss."sellerId",   
                ss."shipperId",
                u_seller."userId" AS seller_userId,
                u_seller.email AS seller_email,
                u_seller.name AS seller_name,
                u_shipper."userId" AS shipper_userId,
                u_shipper.email AS shipper_email,
                u_shipper.name AS shipper_name
            FROM 
                "seller-shippers" ss
            JOIN 
                "users" u_seller ON u_seller."userId" = ss."sellerId"
            JOIN 
                "users" u_shipper ON u_shipper."userId" = ss."shipperId"
            WHERE 
                ss."shipperId" = :userId
            LIMIT :limit OFFSET :offset
        `;

        const countQuery = `
            SELECT COUNT(*) as totalCount
            FROM 
                "seller-shippers" ss
            WHERE 
                ss."shipperId" = :userId
        `;

        try {
            const [results]: any = await sequelize.query(query, {
                replacements: { userId, limit, offset },
                type: QueryTypes.SELECT
            });

            const countResult: any = await sequelize.query(countQuery, {
                replacements: { userId },
                type: QueryTypes.SELECT
            });

            const totalCount = countResult[0]?.totalCount || 0;

            const responseData = {
                count: totalCount,
                rows: Array.isArray(results) ? results : results ? [results] : [],
            };

            return res.sendSuccess(res, responseData, 200);
        } catch (error: any) {
            console.error(error);
            return res.sendError(res, error.message);
        }
    } catch (error: any) {
        console.error(error);
        return res.sendError(res, error.message);
    }
};

