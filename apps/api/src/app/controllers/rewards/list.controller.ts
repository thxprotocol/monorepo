import { Request, Response } from 'express';
import PoolService from '@thxnetwork/api/services/PoolService';
import RewardService from '@thxnetwork/api/services/RewardService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findByRequest(req);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const [coin, nft, custom, coupon, discordRole] = await RewardService.list({
        pool,
        account,
    });

    res.json({ coin, nft, custom, coupon, discordRole });
};

export { controller };
