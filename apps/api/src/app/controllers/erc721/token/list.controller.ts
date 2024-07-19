import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ERC721Token, ERC721TokenDocument, ERC721Metadata } from '@thxnetwork/api/models';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import SafeService from '@thxnetwork/api/services/SafeService';
import { PromiseParser } from '@thxnetwork/api/util';

const validation = [query('walletId').isMongoId(), query('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.query.chainId);
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC721Token.find({ walletId: wallet.id, chainId });
    const results = await PromiseParser.parse(
        tokens.map(async (token: ERC721TokenDocument) => {
            const erc721 = await ERC721Service.findById(token.erc721Id);
            if (!erc721) return;

            const metadata = await ERC721Metadata.findById(token.metadataId);
            if (!metadata) return;

            return Object.assign(token.toJSON() as TERC721Token, { metadata, tokenUri: token.tokenUri, nft: erc721 });
        }),
    );

    res.json(results.reverse());
};

export { controller, validation };
