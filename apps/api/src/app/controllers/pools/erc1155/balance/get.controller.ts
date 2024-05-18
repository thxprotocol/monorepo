import { Request, Response } from 'express';
import { query } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Pool } from '@thxnetwork/api/models';
import ContractService from '@thxnetwork/api/services/ContractService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [query('contractAddress').isEthereumAddress(), query('tokenId').isInt()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    if (!pool) throw new NotFoundError('Pool not found');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Safe not found');

    const contract = ContractService.getContract('THXERC1155', pool.chainId, req.query.contractAddress as string);
    const balance = await contract.balanceOf(safe.address, req.query.tokenId);

    res.json({ balance });
};
export { controller, validation };
