import express from 'express';
import * as ListLotteries from './list.controller';

const router: express.Router = express.Router();

router.get('/', ListLotteries.controller);

export default router;
