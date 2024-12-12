import express from 'express';
import accessControl from '../middlewares/access-control';
import { createOrder, getAllOrdersOfaProduct, getAllOrdersOfaSeller } from '../controllers/order.controller';

const router = express();

router.use(accessControl);
router.route('/by-seller').get(getAllOrdersOfaSeller);
// router.route('/by-product').get(getAllOrdersOfaProduct);
router.route('/by-order').post(createOrder);


export default router;