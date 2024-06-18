import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadInvite from './get.controller';

export const router: express.Router = express.Router();

router.get('/:code', assertRequestInput(ReadInvite.validation), ReadInvite.controller);

export default router;
