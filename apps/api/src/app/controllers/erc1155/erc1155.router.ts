import express from 'express';
import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';

import * as ReadERC1155 from './get.controller';
import * as ListERC1155 from './list.controller';
import * as RemoveERC1155 from './delete.controller';
import * as ListERC1155Metadata from './metadata/list.controller';
import * as ListERC1155Token from './token/list.controller';
import * as ReadERC1155Token from './token/get.controller';
import * as CreateERC1155 from './post.controller';
import * as CreateERC1155Metadata from './metadata/post.controller';

import * as UpdateERC1155 from './patch.controller';
import * as ReadERC1155Metadata from './metadata/get.controller';
import * as PatchERC1155Metadata from './metadata/patch.controller';
import * as DeleteERC1155Metadata from './metadata/delete.controller';
import * as ImportERC1155Contract from './import/post.controller';
import * as PreviewERC1155Contract from './import/preview/post.controller';
import * as CreateERC1155Transfer from './transfer/post.controller';

const router: express.Router = express.Router();

router.get('/token', assertRequestInput(ListERC1155Token.validation), ListERC1155Token.controller);
router.get('/token/:id', ReadERC1155Token.controller);
router.get('/', assertRequestInput(ListERC1155.validation), ListERC1155.controller);
router.get('/:id', assertRequestInput(ReadERC1155.validation), ReadERC1155.controller);
router.post('/', upload.single('file'), assertRequestInput(CreateERC1155.validation), CreateERC1155.controller);
router.post(
    '/import',
    ImportERC1155Contract.controller,
    assertPoolAccess,
    assertRequestInput(ImportERC1155Contract.validation),
);
router.post('/preview', assertRequestInput(PreviewERC1155Contract.validation), PreviewERC1155Contract.controller);
router.patch(
    '/:id/metadata/:metadataId',
    assertRequestInput(PatchERC1155Metadata.validation),
    PatchERC1155Metadata.controller,
);
router.delete(
    '/:id/metadata/:metadataId',
    assertRequestInput(DeleteERC1155Metadata.validation),
    DeleteERC1155Metadata.controller,
);
router.get('/:id/metadata', ListERC1155Metadata.controller);
router.post('/:id/metadata/', assertRequestInput(CreateERC1155Metadata.validation), CreateERC1155Metadata.controller);
router.patch('/:id', assertRequestInput(UpdateERC1155.validation), UpdateERC1155.controller);
router.get(
    '/:id/metadata/:metadataId',
    ReadERC1155Metadata.controller,
    assertRequestInput(ReadERC1155Metadata.validation),
);
router.post('/transfer', assertRequestInput(CreateERC1155Transfer.validation), CreateERC1155Transfer.controller);
router.delete('/:id', assertRequestInput(RemoveERC1155.validation), RemoveERC1155.controller);

export default router;
