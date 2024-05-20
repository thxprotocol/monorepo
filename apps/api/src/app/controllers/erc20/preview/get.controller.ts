import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ChainId } from '@thxnetwork/common/enums';
import ContractService from '@thxnetwork/api/services/ContractService';

const validation = [query('chainId').isInt(), query('address').isEthereumAddress()];

const controller = async (req: Request, res: Response) => {
    const chainId = req.query.chainId as unknown as ChainId;
    const contractAddress = req.query.address as string;
    const contract = ContractService.getContract('THXERC20_LimitedSupply', chainId, contractAddress);
    const [name, symbol, totalSupplyInWei] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.totalSupply(),
    ]);

    res.json({ name, symbol, totalSupplyInWei: totalSupplyInWei.toString() });
};
export { controller, validation };
