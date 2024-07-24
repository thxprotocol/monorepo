import express from 'express';
import ListWallets from './list.controller';
import CreateWallets from './post.controller';
import CreateWalletConfirm from './confirm/post.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListWallets.validation), ListWallets.controller);
router.post('/', assertRequestInput(CreateWallets.validation), CreateWallets.controller);
router.post('/confirm', assertRequestInput(CreateWalletConfirm.validation), CreateWalletConfirm.controller);

export default router;
