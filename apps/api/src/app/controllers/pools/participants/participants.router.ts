import express from 'express';
import { assertRequestInput, assertPoolAccess, guard } from '@thxnetwork/api/middlewares';
import * as ListParticipants from './list.controller';
import * as UpdateParticipants from './patch.controller';
import * as CreateParticipantsBalanceReset from './balance/reset/post.controller';
import * as CreateParticipantsExport from './export/get.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get(
    '/',
    // guard.check(['pools:read']),
    assertPoolAccess,
    assertRequestInput(ListParticipants.validation),
    ListParticipants.controller,
);
router.patch(
    '/:participantId',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(UpdateParticipants.validation),
    UpdateParticipants.controller,
);
router.get(
    '/export',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateParticipantsExport.validation),
    CreateParticipantsExport.controller,
);
router.post(
    '/balance/reset',
    guard.check(['pools:read', 'pools:write']),
    assertPoolAccess,
    assertRequestInput(CreateParticipantsBalanceReset.validation),
    CreateParticipantsBalanceReset.controller,
);

export default router;
