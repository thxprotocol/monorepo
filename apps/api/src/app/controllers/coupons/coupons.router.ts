import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import * as ListCouponCode from './list.controller';
import * as RemoveCouponCode from './delete.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListCouponCode.validation), ListCouponCode.controller);

router.delete('/:couponCodeId/', assertRequestInput(RemoveCouponCode.validation), RemoveCouponCode.controller);

export default router;
