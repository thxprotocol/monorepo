import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import { QRCodeEntry, ERC721Metadata } from '@thxnetwork/api/models';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

const validation = [param('uuid').exists().isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new NotFoundError('QR code entry not found');

    const erc721 = await ERC721Service.findById(entry.erc721Id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    const metadata = await ERC721Metadata.findById(entry.erc721MetadataId);
    if (!metadata) throw new NotFoundError('ERC721 Metadata not found');

    return res.json({ entry, erc721, metadata });
};

export { controller, validation };
