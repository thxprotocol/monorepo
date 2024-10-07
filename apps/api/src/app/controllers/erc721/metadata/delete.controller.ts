import { param } from 'express-validator';
import { Request, Response } from 'express';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ERC721, ERC721Metadata } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId(), param('metadataId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721.findById(req.params.id);
    if (erc721.sub !== req.auth.sub) throw new ForbiddenError('Not your ERC721');

    const metadata = await ERC721Metadata.findById(req.params.metadataId);
    if (!metadata) throw new NotFoundError('ERC721 Metadata not found');

    await ERC721Service.deleteMetadata(req.params.metadataId);

    res.end();
};

export { controller, validation };
