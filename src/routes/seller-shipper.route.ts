import express from 'express';
import accessControl from '../middlewares/access-control';
import { acceptInvitation, inviteShipper } from '../controllers/seller-shipper.controller';

const router = express();

router.use(accessControl);
// router.route('/').get(getAllProductsOfaSeller);
router.route('/invitation').get(acceptInvitation).post(inviteShipper);

export default router;