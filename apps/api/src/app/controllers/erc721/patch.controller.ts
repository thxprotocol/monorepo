import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError('Could not find the token for this id');
    if (erc721.sub !== req.auth.sub) throw new ForbiddenError('Not your ERC721');

    const result = await ERC721.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(result);
};
export { controller, validation };
