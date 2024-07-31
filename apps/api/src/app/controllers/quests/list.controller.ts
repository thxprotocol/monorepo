import { Request, Response } from 'express';
import { getIP } from '@thxnetwork/api/util/ip';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

// This endpoint is public so we do not get req.auth populated
// so we need to decode the auth header manually when it is present
const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findByRequest(req);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const ip = getIP(req);

    // Results are returned in order of the QuestVariant enum keys
    const [daily, invite, twitter, discord, youtube, custom, web3, gitcoin, webhook] = await QuestService.list({
        pool,
        account,
        data: { ip },
    });

    res.json({
        daily,
        custom,
        invite,
        twitter,
        discord,
        youtube,
        web3,
        gitcoin,
        webhook,
    });
};

export { controller };
