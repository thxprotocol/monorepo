import express from 'express';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import CreatePassword from './pwd/post.controller';
import CreateJWT from './jwt/post.controller';

const router: express.Router = express.Router();

router.post('/pwd', corsHandler, assertRequestInput(CreatePassword.validation), CreatePassword.controller);
router.post('/jwt', checkJwt, corsHandler, assertRequestInput(CreateJWT.validation), CreateJWT.controller);

export default router;
