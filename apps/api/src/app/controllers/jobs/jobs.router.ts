import express from 'express';
import * as ReadJobs from './get.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

router.get('/:id', assertRequestInput(ReadJobs.validation), ReadJobs.controller);

export default router;
