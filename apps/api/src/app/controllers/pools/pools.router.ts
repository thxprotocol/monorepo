import express from 'express';
import { assertRequestInput, assertPoolAccess, assertPayment } from '@thxnetwork/api/middlewares';

import * as ListController from './list.controller';
import * as ReadController from './get.controller';
import * as CreateController from './post.controller';
import * as UpdateController from './patch.controller';
import * as DeleteController from './delete.controller';
import * as CreateDuplicate from './duplicate/post.controller';

import RouterCollaborators from './collaborators/collaborators.router';
import RouterParticipants from './participants/participants.router';
import RouterAnalytics from './analytics/analytics.router';
import RouterQuests from './quests/quests.router';
import RouterRewards from './rewards/rewards.router';
import RouterGuilds from './guilds/guilds.router';
import RouterPayments from './payments/payments.router';
import RouterERC20 from './erc20/erc20.router';
import RouterER1155 from './erc1155/erc1155.router';
import RouterIntegrations from './integrations/integrations.router';
import RouterWallets from './wallets/wallets.router';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.post('/', assertRequestInput(CreateController.validation), CreateController.controller);

// This route is also asserted for payment but not for access
router.use('/:id/collaborators', assertPayment, RouterCollaborators);

// Everything below is asserted for campaign/pool access
router.use('/:id', assertPoolAccess);
router.get('/:id', assertRequestInput(ReadController.validation), ReadController.controller);
router.patch('/:id', assertRequestInput(UpdateController.validation), UpdateController.controller);
router.delete('/:id', assertRequestInput(DeleteController.validation), DeleteController.controller);
router.post('/:id/duplicate', assertRequestInput(CreateDuplicate.validation), CreateDuplicate.controller);

// Payment related routes that require access event if payment assertion fails
router.use('/:id/erc20', RouterERC20); // Needed for payment processing
router.use('/:id/payments', RouterPayments);

// Everything below is asserted for payment
router.use('/:id', assertPayment);
router.use('/:id/analytics', RouterAnalytics);
router.use('/:id/quests', RouterQuests);
router.use('/:id/rewards', RouterRewards);
router.use('/:id/participants', RouterParticipants);
router.use('/:id/guilds', RouterGuilds);
router.use('/:id/erc1155', RouterER1155);
router.use('/:id/integrations', RouterIntegrations);
router.use('/:id/wallets', RouterWallets);

export default router;
