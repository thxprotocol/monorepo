import { Request, Response } from 'express';
import { param } from 'express-validator';
import { subWeeks } from 'date-fns';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('campaignId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.campaignId);
    const endDate = new Date();
    const startDate = subWeeks(endDate, pool.settings.leaderboardInWeeks);
    const options = { startDate, endDate };
    const leaderboard = await PoolService.getLeaderboardFromCache(pool, options);
    const result = await PoolService.getLeaderboardTop(leaderboard, 10);

    res.json(result);
};

export { controller, validation };
