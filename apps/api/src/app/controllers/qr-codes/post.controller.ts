import { Request, Response } from 'express';
import { body } from 'express-validator';
import QRCodeService from '@thxnetwork/api/services/ClaimService';

const validation = [
    body('erc721Id').isMongoId(),
    body('erc721MetadataId').isMongoId(),
    body('amount').isInt(),
    body('redirectURL').isURL({ require_tld: false }),
];

const controller = async (req: Request, res: Response) => {
    const { redirectURL, erc721Id, erc721MetadataId } = req.body;
    const amount = Number(req.body.amount);
    const entries = await QRCodeService.create(
        { accountId: req.auth.sub, erc721Id, erc721MetadataId, redirectURL },
        amount,
    );

    res.status(201).json(entries);
};

export { controller, validation };
