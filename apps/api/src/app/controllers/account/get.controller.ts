import { Request, Response } from 'express';
import { WalletVariant, AccountVariant } from '@thxnetwork/common/enums';
import WalletService from '@thxnetwork/api/services/WalletService';
import THXService from '@thxnetwork/api/services/THXService';

const validation = [];

const controller = async (req: Request, res: Response) => {
    // Connect identity if none exists
    await THXService.connect(req.auth);

    // If account variant is metamask and no wallet is found then create it
    if (req.auth.variant === AccountVariant.Metamask) {
        const wallet = await WalletService.findOne({
            sub: req.auth.sub,
            variant: WalletVariant.WalletConnect,
            address: req.auth.address,
        });
        if (!wallet) {
            await WalletService.createWalletConnect({
                sub: req.auth.sub,
                address: req.auth.address,
            });
        }
    }

    res.json(req.auth);
};

export default { controller, validation };
