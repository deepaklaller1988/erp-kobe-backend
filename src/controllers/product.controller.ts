import { AuthenticatedRequest } from '../types/middlewareTypes';
import { Products, SellerShippers, Users } from '../db/models';
import { Response } from 'express';
import { v4 as uuid_v4 } from 'uuid';

export const getAllProductsOfaSeller = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        let userId = await req.userId;
        if (!userId) {
            return res.sendError(res, "ERR_MISSING_SELLER_ID");
        }
        let checkUser = await Users.findOne({
            where: {
                userId
            }
        })
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        let products = await Products.findAndCountAll({
            where: {
                sellerId: userId
            },
            offset: offset,
            limit: limit,
        });

        return res.sendSuccess(res, products, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let { name, totalQuantity } = await req.body;
        if (!name || !totalQuantity) {
            return res.sendError(res, "ERR_MISSING_FIELDS");
        }
        let userId = await req.userId;
        if (!userId) {
            return res.sendError(res, "ERR_MISSING_SELLER_ID");
        }
        let checkUser = await Users.findOne({
            where: {
                userId
            }
        })
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        const productId = await uuid_v4();
        await Products.create({
            productId: `PID-${productId}`,
            name,
            sellerId: userId,
            totalQuantity,
            availableQuantity: totalQuantity
        })

        return res.sendSuccess(res, { message: 'Product added successfully' }, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}