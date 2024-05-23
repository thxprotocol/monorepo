import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { Participant } from '@thxnetwork/api/models';

const validation = [param('campaignId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.campaignId);
    const participants = await Participant.find({ poolId: pool.id }).sort({ score: -1 }).limit(10).exec();
    const subs = participants.map((p) => p.sub);
    const accounts = await AccountProxy.find({ subs });
    const result = participants.map((p) => {
        const { username, profileImg } = accounts.find((a) => a.sub === p.sub);
        return {
            rank: p.rank,
            account: { username, profileImg },
            questEntryCount: p.questEntryCount,
            score: p.score,
        };
    });

    res.json(result);
};

export { controller, validation };
