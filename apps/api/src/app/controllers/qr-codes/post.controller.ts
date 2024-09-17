import { Request, Response } from 'express';
import { body } from 'express-validator';
import QRCodeService from '@thxnetwork/api/services/ClaimService';

const validation = [
    body('rewardId').isMongoId(),
    body('claimAmount').isInt(),
    body('redirectURL').isURL({ require_tld: false }),
];

const controller = async (req: Request, res: Response) => {
    const redirectURL = req.body.redirectURL;
    const claimAmount = Number(req.body.claimAmount);
    const entries = await QRCodeService.create({ accountId: req.auth.sub, redirectURL }, claimAmount);

    res.status(201).json(entries);
};

export { controller, validation };
