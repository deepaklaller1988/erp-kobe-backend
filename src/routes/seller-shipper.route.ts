import express from 'express';
import accessControl from '../middlewares/access-control';

const router = express();

router.use(accessControl);
// router.route('/').get(getAllProductsOfaSeller);

export default router;