import { body } from 'express-validator';
import { Request, Response } from 'express';
import { ERC721, ERC721Token, ERC721Metadata, Wallet } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { getNFTsForOwner } from '@thxnetwork/api/util/alchemy';
import { ChainId, ERC721TokenState, NFTVariant } from '@thxnetwork/common/enums';
import { toChecksumAddress } from 'web3-utils';

const validation = [
    body('address').isEthereumAddress(),
    body('contractAddress').exists(),
    body('chainId').exists().isNumeric(),
];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.body.chainId) as ChainId;
    const contractAddress = toChecksumAddress(req.body.contractAddress);
    const safeAddress = toChecksumAddress(req.body.address);
    const ownedNfts = await getNFTsForOwner(safeAddress, contractAddress);
    if (!ownedNfts.length) throw new NotFoundError('Could not find NFT tokens for this contract address');

    const { address, name, symbol } = ownedNfts[0].contract;
    const erc721 = await ERC721.findOneAndUpdate(
        {
            sub: req.auth.sub,
            chainId,
            address: toChecksumAddress(address),
        },
        {
            variant: NFTVariant.ERC721,
            sub: req.auth.sub,
            chainId,
            address: toChecksumAddress(address),
            name,
            symbol,
            archived: false,
        },
        { upsert: true, new: true },
    );
    const erc721Tokens = await Promise.all(
        ownedNfts.map(async ({ name, description, collection, tokenId, tokenUri, image }) => {
            try {
                const metadata = await ERC721Metadata.findOneAndUpdate(
                    {
                        erc721Id: erc721.id,
                        externalUrl: collection.externalUrl,
                    },
                    {
                        erc721Id: erc721.id,
                        name,
                        description,
                        image,
                        imageUrl: image.originalUrl,
                        externalUrl: collection.externalUrl,
                    },
                    { upsert: true, new: true },
                );
                const safe = await Wallet.findOne({
                    address: req.body.address,
                    chainId: req.body.chainId,
                });
                const token = await ERC721Token.findOneAndUpdate(
                    { tokenId, walletId: safe.id, erc721Id: erc721.id },
                    {
                        walletId: safe.id,
                        erc721Id: erc721.id,
                        recipient: safe.address,
                        metadataId: metadata.id,
                        tokenUri,
                        tokenId,
                        state: ERC721TokenState.Minted,
                    },
                    { upsert: true, new: true },
                );

                return { ...token.toJSON(), metadata: metadata.toJSON() };
            } catch (error) {
                console.log(error);
            }
        }),
    );

    res.status(201).json({ erc721, erc721Tokens });
};

export { controller, validation };
