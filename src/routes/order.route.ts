import express from 'express';
import accessControl from '../middlewares/access-control';
import { getAllOrdersOfaProduct, getAllOrdersOfaSeller } from '../controllers/order.controller';

const router = express();

router.use(accessControl);
router.route('/by-seller').get(getAllOrdersOfaSeller);
router.route('/by-product').get(getAllOrdersOfaProduct);

export default router;