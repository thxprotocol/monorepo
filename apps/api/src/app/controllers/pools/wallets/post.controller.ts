import { Wallet } from '@thxnetwork/api/models';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { WalletVariant } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { toChecksumAddress } from 'web3-utils';

const validation = [body('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const wallet = await Wallet.findOne({ variant: WalletVariant.Safe, chainId: req.body.chainId, sub: req.auth.sub });
    if (wallet) throw new ForbiddenError('Wallet for this chain already exists');

    const { defaultAccount } = NetworkService.getProvider(req.body.chainId);
    const owners = [toChecksumAddress(defaultAccount)];
    const safe = await SafeService.create({
        sub: req.auth.sub,
        chainId: req.body.chainId,
        safeVersion,
        owners,
    });

    res.status(201).json(safe);
};

export { controller, validation };
