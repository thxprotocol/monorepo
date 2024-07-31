import express from 'express';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import ReadAuthorize from './authorize/get.controller';
import ListCallback from './callback/list.controller';

const router: express.Router = express.Router();

router.get(
    '/authorize/:kind',
    checkJwt,
    corsHandler,
    assertRequestInput(ReadAuthorize.validation),
    ReadAuthorize.controller,
);
router.get('/callback/:kind', corsHandler, assertRequestInput(ListCallback.validation), ListCallback.controller);

export default router;
