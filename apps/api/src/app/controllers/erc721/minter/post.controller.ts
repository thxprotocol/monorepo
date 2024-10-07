import { ERC721 } from '@thxnetwork/api/models/ERC721';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { body, param } from 'express-validator';

const validation = [param('id').isMongoId(), body('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const erc721 = await ERC721.findById(req.params.id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    const wallet = await SafeService.findById(req.body.walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.sub !== req.auth.sub) throw new ForbiddenError('Not your wallet');

    await ERC721Service.addMinter(erc721, wallet.address);
    await erc721.updateOne({ minters: [...erc721.minters, wallet.address] });

    res.status(201).end();
};
export { controller, validation };
