import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';

const validation = [param('id').isMongoId(), query('tokenAddress').isEthereumAddress(), query('walletId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('Campaign not found.');

    const safe = await SafeService.findById(req.query.walletId as string);
    if (!safe) throw new NotFoundError('Campaign Safe not found.');

    const contract = ContractService.getContract(
        'THXERC20_LimitedSupply',
        safe.chainId,
        req.query.tokenAddress as string,
    );
    const balance = await contract.balanceOf(safe.address);

    res.json({ balanceInWei: balance.toString() });
};

export { controller, validation };
