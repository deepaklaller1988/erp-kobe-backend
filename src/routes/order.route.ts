import express from 'express';
import accessControl from '../middlewares/access-control';
import { createOrder, getAllOrdersOfaProduct, getAllOrdersOfaSeller, uploadLabel } from '../controllers/order.controller';
import { upload } from '../utils/upload';


const router = express();



router.use(accessControl);
router.route('/by-seller').get(getAllOrdersOfaSeller);
router.route('/by-product').get(getAllOrdersOfaProduct);
router.route('/').post(createOrder);
router.route('/upload-label').post(upload.single('pdf'), uploadLabel);


export default router;