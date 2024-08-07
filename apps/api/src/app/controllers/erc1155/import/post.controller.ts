import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ERC1155Token } from '@thxnetwork/api/models/ERC1155Token';
import { ERC1155 } from '@thxnetwork/api/models/ERC1155';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { ERC1155TokenState } from '@thxnetwork/common/enums';
import { getNFTsForOwner, parseIPFSImageUrl } from '@thxnetwork/api/util/alchemy';
import { ChainId, NFTVariant } from '@thxnetwork/common/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { ERC1155Metadata } from '@thxnetwork/api/models/ERC1155Metadata';
import { toChecksumAddress } from 'web3-utils';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [body('contractAddress').isEthereumAddress(), body('chainId').isInt(), body('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = toChecksumAddress(req.body.contractAddress);
    const wallet = await SafeService.findById(req.body.walletId);
    if (!wallet) throw new NotFoundError('No wallet found for this chain');

    const ownedNfts = await getNFTsForOwner(wallet.address, contractAddress);
    if (!ownedNfts.length) throw new NotFoundError('Could not find NFT tokens for this contract address');

    let erc1155 = await ERC1155.findOne({
        sub: req.auth.sub,
        chainId,
        address: contractAddress,
    });

    // If erc1155 already exists check if it is owned by the authenticated user
    if (erc1155 && erc1155.sub !== req.auth.sub) {
        throw new ForbiddenError('This is not your contract.');
    }

    // If erc1155 is owned or not existing continue with update or upsert
    erc1155 = await ERC1155.findOneAndUpdate(
        {
            chainId,
            sub: req.auth.sub,
            address: contractAddress,
        },
        {
            chainId,
            sub: req.auth.sub,
            address: contractAddress,
            variant: NFTVariant.ERC1155,
            name: req.body.name,
            archived: false,
            baseURL: '',
        },
        { upsert: true, new: true },
    );

    const erc1155Tokens = await Promise.all(
        ownedNfts.map(async ({ name, description, image, collection, tokenId, tokenUri }) => {
            try {
                const erc1155Id = erc1155.id;
                const imageUrl = parseIPFSImageUrl(image.originalUrl);
                const metadata = await ERC1155Metadata.findOneAndUpdate(
                    {
                        erc1155Id,
                        tokenId,
                    },
                    {
                        erc1155Id,
                        tokenId,
                        name,
                        description,
                        imageUrl,
                        image: imageUrl,
                        externalUrl: collection.externalUrl,
                    },
                    { upsert: true, new: true },
                );
                const erc1155Token = await ERC1155Token.findOneAndUpdate(
                    {
                        erc1155Id,
                        tokenId,
                        sub: req.auth.sub,
                        recipient: wallet.address,
                    },
                    {
                        erc1155Id,
                        tokenId,
                        walletId: wallet.id,
                        tokenUri,
                        sub: req.auth.sub,
                        recipient: wallet.address,
                        state: ERC1155TokenState.Minted,
                        metadataId: String(metadata._id),
                    },
                    { upsert: true, new: true },
                );

                return { ...erc1155Token.toJSON(), metadata: metadata.toJSON() };
            } catch (error) {
                logger.error(error);
            }
        }),
    );

    res.status(201).json({ erc1155, erc1155Tokens });
};

export { controller, validation };
