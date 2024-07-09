import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { Wallet } from '@thxnetwork/api/models';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('id').isMongoId(), body('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const wallet = await Wallet.findOne({ poolId: req.params.id, chainId: req.body.chainId, sub: req.auth.sub });
    if (wallet) throw new ForbiddenError('Wallet for this chain already exists');

    await SafeService.create({
        sub: req.auth.sub,
        chainId: req.body.chainId,
        poolId: req.params.id,
        safeVersion,
    });

    res.end(204);
};

export { controller, validation };
