import express from 'express';
import accessControl from '../middlewares/access-control';
import { acceptInvitation, allOrdersOfaSellerShipper, getAllSellerOfaShipper, inviteShipper } from '../controllers/seller-shipper.controller';

const router = express();

router.use(accessControl);
// router.route('/').get(getAllProductsOfaSeller);
router.route('/invitation').get(acceptInvitation).post(inviteShipper);
router.route('/get-orders').get(allOrdersOfaSellerShipper);
router.route('/all-sellers-under-shipper').get(getAllSellerOfaShipper);

export default router;