import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';

import RouterAllowance from './allowance/allowance.router';
import RouterTransfer from './transfer/transfer.router';
import RouterBalance from './balance/balance.router';
import RouterPreview from './preview/preview.router';

import * as CreateController from './post.controller';
import * as ReadController from './get.controller';
import * as UpdateController from './patch.controller';
import * as DeleteController from './delete.controller';
import * as ListController from './list.controller';

import * as ListERC20Token from './token/list.controller';
import * as ReadERC20Token from './token/get.controller';
import * as ImportERC20 from './token/post.controller';

const router: express.Router = express.Router();

router.use('/transfer', RouterTransfer);
router.use('/balance', RouterBalance);
router.use('/allowance', RouterAllowance);
router.use('/preview', RouterPreview);

// Token Resource should move into /wallet
router.get('/token', assertRequestInput(ListERC20Token.validation), ListERC20Token.controller);
router.get('/token/:id', ReadERC20Token.controller);

// Should be /import controller
router.post('/token', assertRequestInput(ImportERC20.validation), ImportERC20.controller);
// End

router.post('/', upload.single('file'), assertRequestInput(CreateController.validation), CreateController.controller);
router.get('/:id', assertRequestInput(ReadController.validation), ReadController.controller);
router.patch('/:id', assertRequestInput(UpdateController.validation), UpdateController.controller);
router.delete('/:id', assertRequestInput(DeleteController.validation), DeleteController.controller);
router.get('/', assertRequestInput(ListController.validation), ListController.controller);

export default router;
