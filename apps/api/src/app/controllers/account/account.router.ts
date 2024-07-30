import express from 'express';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';

// Account
import RouterWallet from './wallet/wallets.router';
import ReadAccount from './get.controller';
import UpdateAccount from './patch.controller';
import DeleteAccount from './delete.controller';
import ReadEmailConfirm from './email/confirm/get.controller';

// Social OAuth
import * as DeleteAccountToken from './disconnect/delete.controller';
import * as ReadAccountDiscord from './discord/get.controller';
import * as GetAccountByDiscordId from './discord/get.by-discord-id.controller';
import * as CreateTwitterTweet from './twitter/tweet/post.controller';
import * as CreateTwitterUser from './twitter/user/post.controller';
import * as CreateTwitterSearch from './twitter/search/post.controller';
import * as CreateTwitterUserByUsername from './twitter/user/by/username/post.controller';

// Dashboard routes
import RouterInvoices from './invoices/invoices.router';
import RouterClients from './developer/clients/clients.router';
import RouterEvents from './developer/events/events.router';
import RouterIdentities from './developer/identities/identities.router';
import RouterWebhooks from './developer/webhooks/webhooks.router';

const router: express.Router = express.Router();

router.get('/email/confirm', assertRequestInput(ReadEmailConfirm.validation), ReadEmailConfirm.controller);
router.use(checkJwt, corsHandler);

router.use('/invoices', RouterInvoices);
router.use('/developer/clients', RouterClients); // Done
router.use('/developer/events', RouterEvents);
router.use('/developer/identities', RouterIdentities);
router.use('/developer/webhooks', RouterWebhooks);

// App routes
router.use('/wallets', RouterWallet);
router.get('/', ReadAccount.controller);
router.patch('/', UpdateAccount.controller);
router.delete('/', DeleteAccount.controller);

router.delete('/disconnect/:kind', assertRequestInput(DeleteAccountToken.validation), DeleteAccountToken.controller);
router.get('/discord', ReadAccountDiscord.controller);
router.get(
    '/discord/:discordId',
    assertRequestInput(GetAccountByDiscordId.validation),
    GetAccountByDiscordId.controller,
);
router.post('/twitter/tweet', assertRequestInput(CreateTwitterTweet.validation), CreateTwitterTweet.controller);
router.post('/twitter/user/', assertRequestInput(CreateTwitterUser.validation), CreateTwitterUser.controller);
router.post('/twitter/search/', assertRequestInput(CreateTwitterSearch.validation), CreateTwitterSearch.controller);
router.post(
    '/twitter/user/by/username',
    assertRequestInput(CreateTwitterUserByUsername.validation),
    CreateTwitterUserByUsername.controller,
);

export default router;
