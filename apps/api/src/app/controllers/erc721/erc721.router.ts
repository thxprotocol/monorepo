import express from 'express';
import { assertPoolAccess, assertRequestInput } from '@thxnetwork/api/middlewares';
import { upload } from '@thxnetwork/api/util/multer';

import * as ReadERC721 from './get.controller';
import * as ListERC721 from './list.controller';
import * as ListERC721Metadata from './metadata/list.controller';
import * as ListERC721Token from './token/list.controller';
import * as ReadERC721Token from './token/get.controller';
import * as RemoveERC721 from './delete.controller';
import * as CreateERC721 from './post.controller';
import * as CreateMultipleERC721Metadata from './metadata/images/post.controller';
import * as UpdateERC721 from './patch.controller';
import * as ReadERC721Metadata from './metadata/get.controller';
import * as CreateERC721Metadata from './metadata/post.controller';
import * as PatchERC721Metadata from './metadata/patch.controller';
import * as DeleteERC721Metadata from './metadata/delete.controller';
import * as ImportERC721Contract from './import/post.controller';
import * as PreviewERC721Contract from './import/preview/post.controller';
import * as CreateERC721Transfer from './transfer/post.controller';

const router: express.Router = express.Router();

router.get('/token', assertRequestInput(ListERC721Token.validation), ListERC721Token.controller);
router.get('/token/:id', ReadERC721Token.controller);
router.get('/', assertRequestInput(ListERC721.validation), ListERC721.controller);
router.get('/:id', assertRequestInput(ReadERC721.validation), ReadERC721.controller);

router.post('/', upload.single('file'), assertRequestInput(CreateERC721.validation), CreateERC721.controller);

router.post('/transfer', assertRequestInput(CreateERC721Transfer.validation), CreateERC721Transfer.controller);
router.post(
    '/import',
    ImportERC721Contract.controller,
    assertPoolAccess,
    assertRequestInput(ImportERC721Contract.validation),
);
router.post('/preview', assertRequestInput(PreviewERC721Contract.validation), PreviewERC721Contract.controller);
router.patch(
    '/:id/metadata/:metadataId',
    assertRequestInput(PatchERC721Metadata.validation),
    PatchERC721Metadata.controller,
);

router.delete(
    '/:id/metadata/:metadataId',
    assertRequestInput(DeleteERC721Metadata.validation),
    DeleteERC721Metadata.controller,
);

router.get('/:id/metadata', ListERC721Metadata.controller);

router.post('/:id/metadata/', assertRequestInput(CreateERC721Metadata.validation), CreateERC721Metadata.controller);

router.post(
    '/:id/metadata/zip',
    upload.single('file'),
    assertRequestInput(CreateMultipleERC721Metadata.validation),
    CreateMultipleERC721Metadata.controller,
);

router.patch('/:id', assertRequestInput(UpdateERC721.validation), UpdateERC721.controller);

router.get(
    '/:id/metadata/:metadataId',
    ReadERC721Metadata.controller,
    assertRequestInput(ReadERC721Metadata.validation),
);

router.delete('/:id', assertRequestInput(RemoveERC721.validation), RemoveERC721.controller);

export default router;
