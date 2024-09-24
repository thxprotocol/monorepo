import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId(), param('metadataId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const metadata = await ERC721Metadata.findById(req.params.metadataId);
    res.json(metadata);
};

export { controller, validation };
