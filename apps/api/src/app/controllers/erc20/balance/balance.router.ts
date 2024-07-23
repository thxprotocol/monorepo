import express from 'express';
import { assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadController from './get.controller';

const router: express.Router = express.Router();

router.get('/', assertRequestInput(ReadController.validation), ReadController.controller);

export default router;
