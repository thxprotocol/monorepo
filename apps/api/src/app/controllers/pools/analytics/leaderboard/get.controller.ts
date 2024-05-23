import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [
    param('id').isMongoId(),
    query('limit').optional().isInt(),
    query('startDate').optional().isString(),
    query('endDate').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const { startDate, endDate, limit } = req.query;

    let options;
    if (startDate && endDate && limit) {
        options = {};
        options['startDate'] = new Date(String(startDate));
        options['endDate'] = new Date(String(endDate));
        options['limit'] = Number(limit);
    }

    const leaderboard = await AnalyticsService.createLeaderboard(pool, options);
    const topTen = leaderboard.slice(0, 10);
    const subs = topTen.map((p) => p.sub);
    const accounts = await AccountProxy.find({ subs });
    const result = topTen.map((p, index) => {
        const { username, profileImg } = accounts.find((a) => a.sub === p.sub);
        return {
            rank: Number(index) + 1,
            account: { username, profileImg },
            score: p.score,
            questEntryCount: p.questEntryCount,
        };
    });

    res.json(result);
};

export { controller, validation };
