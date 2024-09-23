import express from 'express';
import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadWidget from './get.controller';
import * as UpdateWidget from './patch.controller';
import * as ListWidgets from './list.controller';
import * as DeleteWidget from './delete.controller';

const router: express.Router = express.Router();

router.get('/', ListWidgets.controller);
router.get('/:uuid', assertRequestInput(ReadWidget.validation), assertPoolAccess, ReadWidget.controller);
router.patch('/:uuid', assertRequestInput(UpdateWidget.validation), UpdateWidget.controller);
router.delete('/:id', assertRequestInput(DeleteWidget.validation), DeleteWidget.controller);

export default router;
