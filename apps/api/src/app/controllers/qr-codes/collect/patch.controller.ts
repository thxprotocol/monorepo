import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { QRCodeEntry, ERC721Metadata, Wallet } from '@thxnetwork/api/models';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import WalletService from '@thxnetwork/api/services/WalletService';

const validation = [param('uuid').isUUID(4), query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    let entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new BadRequestError('This claim URL is invalid.');
    if (entry.sub) throw new ForbiddenError('This NFT is claimed already.');

    // Find wallet for the authenticated user
    const wallet = await WalletService.findById(req.query.walletId as string);
    if (!wallet) throw new NotFoundError('Wallet not found');

    // Mint an NFT token if the erc721 and metadata for the claim exists.
    const metadata = await ERC721Metadata.findById(entry.erc721MetadataId);
    if (!metadata) throw new NotFoundError('ERC721 Metadata not found');

    const erc721 = await ERC721Service.findById(metadata.erc721Id);
    if (!erc721) throw new NotFoundError('ERC721 not found');

    // Get the pool Safe for the token network
    const safe = await Wallet.findOne({ chainId: erc721.chainId, sub: entry.accountId });
    if (!safe) throw new BadRequestError('Safe not found.');

    // Mint the NFT
    const token = await ERC721Service.mint(safe, erc721, wallet, metadata);

    // Mark claim as claimed by setting sub
    entry = await QRCodeEntry.findByIdAndUpdate(entry._id, { sub: req.auth.sub, claimedAt: new Date() }, { new: true });

    return res.json({
        erc721,
        entry,
        token,
        metadata,
    });
};

export { controller, validation };
