import { Request, Response } from 'express';
import { param } from 'express-validator';
import { subMonths, subWeeks } from 'date-fns';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('campaignId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.campaignId);
    // Get the current date
    const now = new Date();

    // Calculate the start and end of the current month
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of the next month

    const options = { startDate, endDate };
    const leaderboard = await PoolService.getLeaderboardFromCache(pool, options);
    const result = await PoolService.getLeaderboardTop(leaderboard, 100);

    res.json(result);
};

export { controller, validation };
