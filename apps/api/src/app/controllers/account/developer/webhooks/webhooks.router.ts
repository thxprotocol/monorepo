import express from 'express';
import { assertModelAccess, assertRequestInput, guard } from '@thxnetwork/api/middlewares';
import * as ListWebhook from './list.controller';
import * as PatchWebhook from './patch.controller';
import * as CreateWebhook from './post.controller';
import * as DeleteWebhook from './delete.controller';
import { Webhook } from '@thxnetwork/api/models';

const router: express.Router = express.Router();

router.get('/', guard.check(['webhooks:read']), assertRequestInput(ListWebhook.validation), ListWebhook.controller);
router.patch(
    '/:id',
    guard.check(['webhooks:read']),
    assertModelAccess(Webhook),
    assertRequestInput(PatchWebhook.validation),
    PatchWebhook.controller,
);
router.post(
    '/',
    guard.check(['webhooks:write', 'webhooks:read']),
    assertRequestInput(CreateWebhook.validation),
    CreateWebhook.controller,
);
router.delete(
    '/:id',
    guard.check(['webhooks:write', 'webhooks:read']),
    assertModelAccess(Webhook),
    assertRequestInput(DeleteWebhook.validation),
    DeleteWebhook.controller,
);

export default router;
