import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { subWeeks } from 'date-fns';

const validation = [param('campaignId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.campaignId);
    const endDate = new Date();
    const startDate = subWeeks(endDate, pool.settings.leaderboardInWeeks);
    const options = { limit: 10, startDate, endDate };
    const result = await PoolService.getLeaderboard(pool, options);

    res.json(result);
};

export { controller, validation };
