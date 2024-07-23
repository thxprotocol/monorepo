import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import * as ListParticipants from './list.controller';
import * as UpdateParticipants from './patch.controller';

const router: express.Router = express.Router();

router.get('/', assertRequestInput(ListParticipants.validation), ListParticipants.controller);
router.patch('/:id', assertRequestInput(UpdateParticipants.validation), UpdateParticipants.controller);

export default router;
