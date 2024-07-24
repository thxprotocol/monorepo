import express from 'express';
import { assertRequestInput, corsHandler } from '@thxnetwork/api/middlewares';
import CreateLogin from './post.controller';

const router: express.Router = express.Router();
router.post('/', corsHandler, assertRequestInput(CreateLogin.validation), CreateLogin.controller);

export default router;
