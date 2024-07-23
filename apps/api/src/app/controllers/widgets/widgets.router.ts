import express from 'express';
import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import * as ReadWidget from './get.controller';
import * as UpdateWidget from './patch.controller';
import * as ListWidgets from './list.controller';

const router: express.Router = express.Router();

router.get('/', assertPoolAccess, ListWidgets.controller);
router.get('/:uuid', assertRequestInput(ReadWidget.validation), assertPoolAccess, ReadWidget.controller);
router.patch('/:uuid', assertRequestInput(UpdateWidget.validation), assertPoolAccess, UpdateWidget.controller);

export default router;
