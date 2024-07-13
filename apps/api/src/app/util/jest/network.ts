import { VOTER_PK, DEPOSITOR_PK } from './constants';
import { ChainId } from '@thxnetwork/common/enums';
import { Wallet } from '@thxnetwork/api/models';
import NetworkService from '@thxnetwork/api/services/NetworkService';
import SafeService from '@thxnetwork/api/services/SafeService';

const { web3 } = NetworkService.getProvider(ChainId.Hardhat);

const voter = web3.eth.accounts.privateKeyToAccount(VOTER_PK) as any;
const depositor = web3.eth.accounts.privateKeyToAccount(DEPOSITOR_PK) as any;

function createWallet(privateKey: string): any {
    return web3.eth.accounts.privateKeyToAccount(privateKey);
}

export const timeTravel = async (seconds: number) => {
    web3.extend({
        methods: [
            {
                name: 'increaseTime',
                call: 'evm_increaseTime',
                params: 1,
            },
            {
                name: 'mine',
                call: 'evm_mine',
            },
        ],
    });
    await (web3 as any).increaseTime(seconds);
};

export const signMessage = (privateKey: string, message: string) => {
    const wallet = createWallet(privateKey);
    return wallet.sign(message).signature;
};

export async function signTxHash(safeAddress: string, safeTxHash: string, privateKey: string) {
    const wallet = await Wallet.findOne({ address: safeAddress });
    const tx = await SafeService.getTransaction(wallet, safeTxHash);
    const signature = await signMessage(privateKey, tx.data);
    await SafeService.confirm(wallet, safeTxHash, signature);

    return { safeTxHash, signature };
}

export { voter, depositor, createWallet };
