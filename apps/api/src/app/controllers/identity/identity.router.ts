import express from 'express';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as ReadController from './get.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

router.patch('/:uuid', assertRequestInput(UpdateController.validation), UpdateController.controller);
router.get('/:salt', assertRequestInput(ReadController.validation), ReadController.controller);
router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);

export default router;
