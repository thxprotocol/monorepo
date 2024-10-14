import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721.findById(req.params.id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    const { wallets, minters } = await ERC721Service.getMinters(erc721, req.auth.sub);

    res.json({ wallets, minters });
};
export { controller, validation };
