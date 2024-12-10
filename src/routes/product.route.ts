import express from 'express';
import accessControl from '../middlewares/access-control';
import { getAllProductsOfaSeller } from '../controllers/product.controller';

const router = express();

router.use(accessControl);
router.route('/').get(getAllProductsOfaSeller);

export default router;