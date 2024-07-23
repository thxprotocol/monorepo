import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ListController from './get.controller';
import * as CreateController from './post.controller';

const router: express.Router = express.Router();

router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);
router.get('/', assertRequestInput(ListController.validation), ListController.controller);

export default router;
