import { ERC721, ERC721Metadata, QRCodeEntry } from '@thxnetwork/api/models';
import { Request, Response } from 'express';
import { query } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [
    query('limit').optional().isInt({ gt: 0 }),
    query('page').optional().isInt({ gt: 0 }),
    query('query').optional().isString(), // username
    query('erc721Id').optional().isMongoId(),
    query('erc721MetadataId').optional().isMongoId(),
];

const controller = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const query = { accountId: req.auth.sub };
    if (req.query.erc721Id) query['erc721Id'] = req.query.erc721Id;
    if (req.query.erc721MetadataId) query['erc721MetadataId'] = req.query.erc721MetadataId;

    const total = await QRCodeEntry.countDocuments(query);
    const entries = await QRCodeEntry.find(query)
        .limit(limit)
        .skip((page - 1) * limit);

    const subs = entries.map(({ sub }) => sub);
    const accounts = await AccountProxy.find({ subs });
    const erc721Ids = entries.map(({ erc721Id }) => erc721Id);
    const erc721MetadataIds = entries.map(({ erc721MetadataId }) => erc721MetadataId);
    const erc721s = await ERC721.find({ _id: { $in: erc721Ids } });
    const metadatas = await ERC721Metadata.find({ _id: { $in: erc721MetadataIds } });

    const results = entries.map((entry) => {
        const account = accounts.find((account) => account.sub === entry.sub);
        const metadata = metadatas.find((metadata) => metadata.id === entry.erc721MetadataId);
        const erc721 = erc721s.find((erc721) => erc721.id === entry.erc721Id);
        return Object.assign(entry.toJSON(), { account, metadata, erc721 });
    });
    const meta = {
        claimedCount: await QRCodeEntry.countDocuments({ sub: { $exists: true } }),
    };

    res.json({
        total,
        limit,
        page,
        results,
        meta,
    });
};

export { controller, validation };
