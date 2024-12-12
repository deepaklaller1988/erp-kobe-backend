import express from 'express';
import accessControl from '../middlewares/access-control';
import { createProduct, getAllProductsOfaSeller } from '../controllers/product.controller';

const router = express();

router.use(accessControl);
router.route('/').get(getAllProductsOfaSeller).post(createProduct);

export default router;