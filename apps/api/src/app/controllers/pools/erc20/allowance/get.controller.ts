import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import ContractService from '@thxnetwork/api/services/ContractService';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [
    param('id').isMongoId(),
    query('tokenAddress').isEthereumAddress(),
    query('spender').isEthereumAddress(),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.params.id as string;
    const pool = await PoolService.getById(poolId);
    if (!pool) throw new NotFoundError('Pool not found');

    const safe = await SafeService.findOneByPool(pool);
    if (!safe) throw new NotFoundError('Wallet not found');

    const contract = ContractService.getContract(
        'THXERC20_LimitedSupply',
        safe.chainId,
        req.query.tokenAddress as string,
    );
    const allowance = await contract.allowance(safe.address, req.query.spender);

    res.json({ allowanceInWei: allowance.toString() });
};
export { controller, validation };
