import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError();

    res.json(erc721);
};

export { controller, validation };
