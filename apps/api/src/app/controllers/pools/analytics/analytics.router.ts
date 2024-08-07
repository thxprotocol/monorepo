import express from 'express';
import { assertRequestInput, assertPoolAccess } from '@thxnetwork/api/middlewares';
import RouterMetrics from './metrics/metrics.router';
import RouterLeaderboard from './leaderboard/leaderboard.router';
import * as ListAnalytics from './list.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertPoolAccess, assertRequestInput(ListAnalytics.validation), ListAnalytics.controller);
router.use('/metrics', RouterMetrics);
router.use('/leaderboard', RouterLeaderboard);

export default router;
