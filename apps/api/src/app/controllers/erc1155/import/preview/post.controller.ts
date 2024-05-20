import { Request, Response } from 'express';
import { body } from 'express-validator';
import { getNFTsForOwner, parseIPFSImageUrl } from '@thxnetwork/api/util/alchemy';

const validation = [body('address').exists().isString(), body('contractAddress').exists().isString()];

const controller = async (req: Request, res: Response) => {
    const ownedNFTs = await getNFTsForOwner(req.body.address, req.body.contractAddress);
    res.status(200).json(
        ownedNFTs.map((nft) => {
            return {
                balance: nft.balance,
                name: nft.name,
                description: nft.description,
                tokenId: nft.tokenId,
                tokenUri: nft.tokenUri,
                image: parseIPFSImageUrl(nft.image.originalUrl),
            };
        }),
    );
};
export { controller, validation };
