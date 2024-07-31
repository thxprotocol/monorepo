import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import * as ListParticipants from './list.controller';
import * as UpdateParticipants from './patch.controller';
import * as CreateParticipantsBalanceReset from './balance/reset/post.controller';
import * as CreateParticipantsExport from './export/get.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListParticipants.validation), ListParticipants.controller);
router.patch(
    '/:participantId',
    assertPoolAccess,
    assertRequestInput(UpdateParticipants.validation),
    UpdateParticipants.controller,
);
router.get(
    '/export',
    assertPoolAccess,
    assertRequestInput(CreateParticipantsExport.validation),
    CreateParticipantsExport.controller,
);
router.post(
    '/balance/reset',
    assertPoolAccess,
    assertRequestInput(CreateParticipantsBalanceReset.validation),
    CreateParticipantsBalanceReset.controller,
);

export default router;
