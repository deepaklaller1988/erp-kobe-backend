import { Orders, Products, Users } from '../db/models';
import { AuthenticatedRequest } from '../types/middlewareTypes';
import { Response } from 'express';
import { v4 as uuid_v4 } from 'uuid';
import sequelize from '../db/dbConnect';
import multer from 'multer';
import fs from 'fs';

export const getAllOrdersOfaSeller = async (req: AuthenticatedRequest, res: Response) => {
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

        let orders = await Orders.findAndCountAll({
            where: {
                sellerId: userId
            },
            include: [Products],
            offset: offset,
            limit: limit,
        });

        return res.sendSuccess(res, orders, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export const getAllOrdersOfaProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let userId = await req.userId;
        if (!userId) {
            return res.sendError(res, "ERR_MISSING_SELLER_ID");
        }

        let productId: any = req.query.productId;
        if (!productId) {
            return res.sendError(res, "ERR_MISSING_PRODUCT_ID");
        }

        let checkProduct = await Products.findOne({
            where: {
                productId
            }
        })
        if (!checkProduct) {
            return res.sendError(res, "ERR_PRODUCT_NOT_FOUND");
        }

        let products = await Orders.findAndCountAll({
            where: {
                productId
            },
            include: [Products],
            offset: offset,
            limit: limit,
        });

        return res.sendSuccess(res, products, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
    try {
        let { productId, usedQuantity, label, note } = await req.body;
        let userId = await req.userId;
        if (!userId) {
            return res.sendError(res, "ERR_MISSING_SELLER_ID");
        }
        if (!productId || !usedQuantity || !label) {
            return res.sendError(res, "ERR_MISSING_FIELDS");
        }

        let checkUser = await Users.findOne({
            where: {
                userId
            }
        })
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        let checkProduct: any = await Products.findOne({
            where: {
                productId
            }
        })
        if (!checkProduct) {
            return res.sendError(res, "ERR_PRODUCT_NOT_FOUND");
        }

        if (usedQuantity > checkProduct.availableQuantity) {
            return res.sendError(res, "ERR_INVALID_USED_QUANTITY");
        }

        const orderId = await uuid_v4();
        await Orders.create({
            orderId: `OID-${orderId}`,
            productId,
            sellerId: userId,
            usedQuantity,
            label,
            note,
            status: "pending"
        });
        return res.sendSuccess(res, { message: 'Order created successfully' }, 200);
    } catch (error: any) {
        return res.sendError(res, error.message);
    }
}

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await sequelize.transaction();
    try {
        let { orderId, status } = await req.body;
        let userId = await req.userId;
        if (!userId) {
            return res.sendError(res, "ERR_MISSING_SELLER_ID");
        }
        if (!orderId || !status) {
            return res.sendError(res, "ERR_MISSING_FIELDS");
        }

        const validStatus = ['pending', 'started', 'completed'];
        if (!validStatus.includes(status)) {
            return res.sendError(res, "ERR_INVALID_STATUS");
        }

        let checkUser = await Users.findOne({
            where: {
                userId
            }
        })
        if (!checkUser) {
            return res.sendError(res, "ERR_USER_NOT_FOUND");
        }

        let checkOrder: any = await Orders.findOne({
            where: {
                orderId
            }
        })
        if (!checkOrder) {
            return res.sendError(res, "ERR_ORDER_NOT_FOUND");
        }

        let checkProduct: any = await Products.findOne({
            where: {
                productId: checkOrder?.productId
            }
        })
        if (!checkProduct) {
            return res.sendError(res, "ERR_PRODUCT_NOT_FOUND");
        }

        await Orders.update({
            status
        }, {
            where: {
                orderId
            },
            transaction
        });

        if (checkOrder?.usedQuantity > checkProduct?.availableQuantity) {
            return res.sendError(res, "ERR_INVALID_USED_QUANTITY");
        }

        if (status === "completed") {
            await Products.update({
                availableQuantity: checkProduct?.availableQuantity - checkOrder?.usedQuantity
            }, {
                where: {
                    productId: checkOrder?.productId
                },
                transaction
            })
        }
        await transaction.commit();
        return res.sendSuccess(res, { message: 'Order status updated successfully' }, 200);
    } catch (error: any) {
        await transaction.rollback();
        return res.sendError(res, error.message);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = `./uploads`;

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        cb(null, dirPath);
    },
    filename: (req, file, cb) => {
        const newFileName = `label-${new Date().getMilliseconds().toString()}-${file.originalname}`;
        cb(null, newFileName);
    }
});

const upload = multer({ storage });

export const uploadLabel = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.sendError(res, "ERR_MISSING_PDF");
        }
        upload.single('files')(req, res, (err: any) => {
            if (err) {
                return res.sendError(res, err.message || "ERR_UPLOAD_FAILED");
            }

            const newURL = file.filename;

            return res.sendSuccess(res, { url: newURL }, 200);
        });
    } catch (error: any) {
        console.error("File upload error: ", error);
        return res.sendError(res, error.message);
    }
};