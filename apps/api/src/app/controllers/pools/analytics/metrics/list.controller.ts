import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { Participant } from '@thxnetwork/api/models/Participant';
import AnalyticsService from '@thxnetwork/api/services/AnalyticsService';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    param('id').isMongoId(),
    query('limit').optional().isInt(),
    query('startDate').optional().isString(),
    query('endDate').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const startDate = new Date(String(req.query.startDate));
    const endDate = new Date(String(req.query.endDate));
    const period = { createdAt: { $gte: startDate, $lte: endDate } };
    const [metrics, participantCount, participantActiveCount, subscriptionCount] = await Promise.all([
        AnalyticsService.getPoolMetrics(pool, { startDate, endDate }),
        Participant.countDocuments({ poolId: pool.id, ...period }),
        Participant.countDocuments({ poolId: pool.id, score: { $gt: 0 }, ...period }),
        Participant.countDocuments({ poolId: pool.id, isSubscribed: true, ...period }),
    ]);

    res.json({ _id: pool._id, participantCount, participantActiveCount, subscriptionCount, ...metrics });
};

export { controller, validation };
