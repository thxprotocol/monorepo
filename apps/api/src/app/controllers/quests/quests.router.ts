import { assertAccount, assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import { limitInSeconds } from '@thxnetwork/api/util/ratelimiter';
import express from 'express';
import * as ListQuests from './list.controller';
import * as ListQuestsPublic from './recent/list.controller';
import * as CreateQuestEntry from './entries/post.controller';
import RouterQuestCashback from './cashback/cashback.router';
import * as ValidateQuestEntry from './validate.controller';

const router: express.Router = express.Router();

router.get('/', ListQuests.controller);
router.get('/public', ListQuestsPublic.controller);
router.use('/cashback', RouterQuestCashback);
router.post(
    '/:variant/:id/entries',
    limitInSeconds(3),
    checkJwt,
    corsHandler,
    assertRequestInput(CreateQuestEntry.validation),
    assertAccount,
    CreateQuestEntry.controller,
);
router.post(
    '/:variant/:id/validate',
    limitInSeconds(3),
    checkJwt,
    corsHandler,
    assertRequestInput(ValidateQuestEntry.validation),
    assertAccount,
    ValidateQuestEntry.controller,
);
// router.use(checkJwt).use(corsHandler);

export default router;
