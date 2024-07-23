import express from 'express';
import * as CreateEvents from './post.controller';
import { assertRequestInput } from '@thxnetwork/api/middlewares';

const router: express.Router = express.Router();

router.post('/', assertRequestInput(CreateEvents.validation), CreateEvents.controller);

export default router;
