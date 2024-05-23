import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadLeaderboard from './get.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ReadLeaderboard.validation), ReadLeaderboard.controller);

export default router;
