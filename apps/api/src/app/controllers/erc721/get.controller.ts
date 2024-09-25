import { Wallet, WalletDocument } from '@thxnetwork/api/models';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { PromiseParser } from '@thxnetwork/api/util';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { WalletVariant } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    let erc721 = await ERC721Service.findById(req.params.id);
    if (!erc721) throw new NotFoundError();

    // Check if pending transaction is mined.
    if (!erc721.address) {
        erc721 = await ERC721Service.queryDeployTransaction(erc721);
    }

    const wallets = await Wallet.find({
        sub: req.auth.sub,
        chainId: erc721.chainId,
        variant: WalletVariant.Safe,
        owners: { $size: 1 },
    });
    const minters = (
        await PromiseParser.parse(
            wallets.map(async (wallet: WalletDocument) => {
                const isMinter = await ERC721Service.isMinter(erc721, wallet.address);
                return { ...wallet.toJSON(), isMinter };
            }),
        )
    ).filter((wallet: any) => wallet.isMinter);

    res.json({ ...erc721.toJSON(), minters });
};

export { controller, validation };
