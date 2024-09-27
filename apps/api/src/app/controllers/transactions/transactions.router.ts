import { assertRequestInput } from '@thxnetwork/api/middlewares';
import express from 'express';
import DeleteController from './delete.controller';
import ReadController from './get.controller';
import ListController from './list.controller';
import UpdateController from './patch.controller';

const router: express.Router = express.Router({ mergeParams: true });

router.get('/', assertRequestInput(ListController.validation), ListController.controller);
router.get('/:id', assertRequestInput(ReadController.validation), ReadController.controller);
router.patch('/:id', assertRequestInput(UpdateController.validation), UpdateController.controller);
router.delete('/:id', assertRequestInput(DeleteController.validation), DeleteController.controller);

export default router;
