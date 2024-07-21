import { Request, Response } from 'express';
import { Pool, Participant } from '@thxnetwork/api/models';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import THXService from '@thxnetwork/api/services/THXService';

const validation = [query('poolId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.query.poolId as string;
    const query = { sub: req.auth.sub };
    if (poolId) query['poolId'] = poolId;

    // Extend participant details with pool info
    const participants = await Participant.find(query);
    const pools = await Pool.find({ _id: participants.map((p) => p.poolId) });
    const result = participants.map(({ _id, poolId, balance, isSubscribed }) => {
        const pool = pools.find((pool) => pool.id === poolId);
        return {
            _id,
            balance,
            isSubscribed,
            campaign: { title: pool ? pool.settings.title : '' },
        };
    });

    // Run pool specific operations
    if (poolId) {
        const pool = await PoolService.getById(poolId);
        const account = await AccountProxy.findById(req.auth.sub);
        if (!account) throw new NotFoundError('Account not found.');

        // Force connect account address as identity might be available
        await THXService.forceConnect(pool, account);

        // If no participants were found, create a participant for the authenticated user
        if (!participants.length) {
            const query = { poolId, sub: account.sub };
            const participant = await Participant.findOneAndUpdate(query, { ...query }, { new: true, upsert: true });
            participants.push(participant);
        }
    }

    res.json(result);
};

export { controller, validation };
