import { Request, Response } from 'express';
import { ERC1155Token, ERC1155TokenDocument } from '@thxnetwork/api/models/ERC1155Token';
import { query } from 'express-validator';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import { PromiseParser } from '@thxnetwork/api/util';
import SafeService from '@thxnetwork/api/services/SafeService';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

const validation = [query('walletId').isMongoId(), query('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const chainId = Number(req.query.chainId);
    const wallet = await SafeService.findById(req.query.walletId as string);
    if (!wallet) throw new BadRequestError('Wallet not found');

    const tokens = await ERC1155Token.find({ walletId: wallet._id, chainId });
    const results = await PromiseParser.parse(
        tokens.map(async (token: ERC1155TokenDocument) => {
            const erc1155 = await ERC1155Service.findById(token.erc1155Id);
            if (!erc1155) throw new BadRequestError('ERC1155 not found');

            const metadata = await ERC1155Service.findMetadataById(token.metadataId);
            if (!metadata) throw new BadRequestError('Metadata not found');

            return Object.assign(token.toJSON() as TERC1155Token, { metadata, nft: erc1155 });
        }),
    );

    res.json(results.reverse());
};

export { controller, validation };
