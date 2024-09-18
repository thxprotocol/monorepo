import express from 'express';
import { assertRequestInput, checkJwt, corsHandler } from '@thxnetwork/api/middlewares';
import * as ListEntry from './list.controller';
import * as CreateEntry from './post.controller';
import * as ReadEntry from './get.controller';
import * as DeleteEntryController from './delete.controller';
import * as ReadRedirectEntry from './redirect/get.controller';
import * as UpdateEntryController from './collect/patch.controller';

const router: express.Router = express.Router();

router.get('/:uuid', assertRequestInput(ReadEntry.validation), ReadEntry.controller);
router.get('/r/:uuid', assertRequestInput(ReadRedirectEntry.validation), ReadRedirectEntry.controller);
router.use(checkJwt, corsHandler);
router.get('/', assertRequestInput(ListEntry.validation), ListEntry.controller);
router.post('/', assertRequestInput(CreateEntry.validation), CreateEntry.controller);
router.delete('/:id', assertRequestInput(DeleteEntryController.validation), DeleteEntryController.controller);
router.patch('/:uuid', assertRequestInput(UpdateEntryController.validation), UpdateEntryController.controller);

export default router;
