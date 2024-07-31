import express from 'express';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as ReadController from './get.controller';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

router.get('/:salt', assertRequestInput(ReadController.validation), ReadController.controller);
router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);
router.patch(
    '/:uuid',
    checkJwt,
    corsHandler,
    assertRequestInput(UpdateController.validation),
    UpdateController.controller,
);

export default router;
