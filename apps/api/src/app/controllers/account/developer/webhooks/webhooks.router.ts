import express from 'express';
import { assertModelAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ListWebhook from './list.controller';
import * as PatchWebhook from './patch.controller';
import * as CreateWebhook from './post.controller';
import * as DeleteWebhook from './delete.controller';
import { Webhook } from '@thxnetwork/api/models';

const router: express.Router = express.Router();

router.get('/', assertRequestInput(ListWebhook.validation), ListWebhook.controller);
router.patch('/:id', assertModelAccess(Webhook), assertRequestInput(PatchWebhook.validation), PatchWebhook.controller);
router.post('/', assertRequestInput(CreateWebhook.validation), CreateWebhook.controller);
router.delete(
    '/:id',
    assertModelAccess(Webhook),
    assertRequestInput(DeleteWebhook.validation),
    DeleteWebhook.controller,
);

export default router;
