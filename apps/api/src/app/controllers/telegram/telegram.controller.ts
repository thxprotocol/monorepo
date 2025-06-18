import { Router } from 'express';
import { telegramService } from '../../services/telegram.service';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import { param, query } from 'express-validator';

const router = Router();

router.get('/rewards/:userId', assertRequestInput([param('userId').isNumeric()]), async (req, res) => {
    const rewards = await telegramService.getUserRewards(Number(req.params.userId));
    res.json(rewards);
});

router.get(
    '/activities/:userId',
    assertRequestInput([param('userId').isNumeric(), query('limit').optional().isInt({ min: 1, max: 100 })]),
    async (req, res) => {
        const activities = await telegramService.getUserActivities(
            Number(req.params.userId),
            Number(req.query.limit) || 10,
        );
        res.json(activities);
    },
);

router.get(
    '/leaderboard',
    assertRequestInput([query('limit').optional().isInt({ min: 1, max: 100 })]),
    async (req, res) => {
        const topUsers = await telegramService.getTopUsers(Number(req.query.limit) || 10);
        res.json(topUsers);
    },
);

export default router;
