import { ERC721Metadata, QRCodeEntry, Wallet } from '@thxnetwork/api/models';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import WalletService from '@thxnetwork/api/services/WalletService';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { WalletVariant } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { param, query } from 'express-validator';

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
    const safe = await Wallet.findOne({
        chainId: erc721.chainId,
        sub: entry.accountId,
        variant: WalletVariant.Safe,
        owners: { $size: 1 },
    });
    if (!safe) throw new BadRequestError('Safe not found.');

    // Prepare token for user
    const token = await ERC721Service.createToken(erc721, metadata, wallet);
    // Mint the NFT
    const tx = await ERC721Service.mint(safe, erc721, wallet, metadata);

    await token.updateOne({ transactions: [tx.id] });

    // Mark claim as claimed by setting sub
    entry = await QRCodeEntry.findByIdAndUpdate(
        entry.id,
        { sub: req.auth.sub, transactionId: tx.id, erc721TokenId: token.id, claimedAt: new Date() },
        { new: true },
    );

    return res.json({
        erc721,
        token,
        entry,
        metadata,
    });
};

export { controller, validation };
