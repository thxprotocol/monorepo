import { ethers } from 'ethers';
import { VOTER_PK, DEPOSITOR_PK } from './constants';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/common/enums';
import { contractNetworks } from '@thxnetwork/api/hardhat';
import { HARDHAT_RPC, SAFE_TXS_SERVICE } from '@thxnetwork/api/config/secrets';
import Safe, { EthersAdapter } from '@safe-global/protocol-kit';
import SafeApiKit from '@safe-global/api-kit';

const { web3 } = getProvider(ChainId.Hardhat);

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
    const provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
    const signer = new ethers.Wallet(privateKey, provider);
    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer as any }) as any;
    const safe = await Safe.create({
        ethAdapter,
        safeAddress,
        contractNetworks,
    });
    const signedTx = await safe.signTransactionHash(safeTxHash);
    const apiKit = new SafeApiKit({ txServiceUrl: SAFE_TXS_SERVICE, ethAdapter });
    const { signature } = await apiKit.confirmTransaction(safeTxHash, signedTx.data);

    return { safeTxHash, signature };
}

export { voter, depositor, createWallet };
