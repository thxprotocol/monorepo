import { Request, Response } from 'express';
import { body } from 'express-validator';
import { toChecksumAddress } from 'web3-utils';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';

const validation = [
    body('address').isString().customSanitizer(toChecksumAddress),
    body('chainId').isInt(),
    body('logoImgUrl').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const erc20 = await ERC20Service.importToken(
        Number(req.body.chainId),
        req.body.address,
        req.auth.sub,
        req.body.logoImgUrl,
    );

    res.status(201).json(erc20);
};
export { controller, validation };
