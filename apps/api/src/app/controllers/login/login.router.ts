import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import express from 'express';
import CreateJWT from './jwt/post.controller';
import CreatePassword from './pwd/post.controller';

const router: express.Router = express.Router();

router.post('/pwd', corsHandler, assertRequestInput(CreatePassword.validation), CreatePassword.controller);
router.post('/jwt', checkJwt, corsHandler, assertRequestInput(CreateJWT.validation), CreateJWT.controller);

export default router;
