import { Request, Response } from 'express';
import { Pool, Participant } from '@thxnetwork/api/models';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import IdentityService from '@thxnetwork/api/services/IdentityService';

const validation = [query('poolId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.query.poolId as string;
    const query = { sub: req.auth.sub };
    if (poolId) query['poolId'] = poolId;

    // console.log(req, '------------------------------------------------');
    // Extend participant details with pool info
    const participants = await Participant.find(query);
    const pools = await Pool.find({ _id: participants.map((p) => p.poolId) });

    const account = await AccountProxy.findById(req.auth.sub);
    if (!account) throw new NotFoundError('Account not found.');

    // Apply IdentityService connection to all pools
    for (const pool of pools) {
        await IdentityService.forceConnect(pool, account);
        await IdentityService.forceConnectClidUUID(pool, account);
    }

    // If no participants were found, create a participant for the authenticated user
    if (!participants.length) {
        for (const pool of pools) {
            const query = { poolId: pool.id, sub: account.sub };
            const participant = await Participant.findOneAndUpdate(query, { ...query }, { new: true, upsert: true });
            participants.push(participant);
        }
    }

    // Decorate response
    const result = participants.map((p) => {
        const pool = pools.find((pool) => pool.id === p.poolId);
        return {
            ...p.toJSON(),
            campaign: { title: pool ? pool.settings.title : '' },
        };
    });

    res.json(result);
};

export { controller, validation };
