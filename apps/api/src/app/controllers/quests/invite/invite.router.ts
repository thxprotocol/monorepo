import express, { Router } from 'express';
import { assertRequestInput, assertAccount } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';
import * as CreateEntries from './entries/post.controller';

const router: express.Router = Router({ mergeParams: true });

router.post(
    '/:id/entries',
    limitInSeconds(3),
    assertRequestInput(CreateEntries.validation),
    assertAccount,
    CreateEntries.controller,
);

export default router;
