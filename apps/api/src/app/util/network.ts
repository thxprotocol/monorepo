import {
    HARDHAT_RPC,
    POLYGON_RELAYER,
    POLYGON_RELAYER_API_KEY,
    POLYGON_RELAYER_API_SECRET,
    POLYGON_RPC,
    PRIVATE_KEY,
    RELAYER_SPEED,
    SAFE_TXS_SERVICE,
} from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import { ethers, Signer, Wallet } from 'ethers';
import { Contract } from 'web3-eth-contract';
import { recoverAddress, hashMessage } from 'ethers/lib/utils';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { DefenderRelaySigner } from '@openzeppelin/defender-relay-client/lib/ethers';
import { Relayer } from '@openzeppelin/defender-relay-client';
import { DefenderRelayProvider } from '@openzeppelin/defender-relay-client/lib/web3';
import { ChainId } from '@thxnetwork/common/enums';
import ContractService from '@thxnetwork/api/services/ContractService';

export const MaxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

const web3 = new Web3();
const networks: {
    [chainId: number]: {
        web3: Web3;
        txServiceUrl: string;
        signer: Signer;
        ethAdapter: any;
        defaultAccount: string;
        relayer?: Relayer;
    };
} = {};

if (HARDHAT_RPC) {
    networks[ChainId.Hardhat] = (() => {
        const web3 = new Web3(HARDHAT_RPC);
        const signer = new Wallet(PRIVATE_KEY, new ethers.providers.JsonRpcProvider(HARDHAT_RPC));
        const methods = [
            { name: 'setAutomine', call: 'evm_setAutomine', params: 1 },
            { name: 'setIntervalMining', call: 'evm_setIntervalMining', params: 1 },
        ];
        web3.extend({ property: 'hardhat', methods });
        return {
            web3,
            txServiceUrl: SAFE_TXS_SERVICE,
            ethAdapter: new EthersAdapter({ ethers, signerOrProvider: signer as any }),
            signer,
            defaultAccount: web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY).address,
        };
    })();
}

if (POLYGON_RELAYER) {
    networks[ChainId.Polygon] = (() => {
        const provider = new DefenderRelayProvider(
            { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET },
            { speed: RELAYER_SPEED },
        );
        const relayer = new Relayer({ apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET });
        const signer = new DefenderRelaySigner(
            { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET },
            new ethers.providers.JsonRpcProvider(POLYGON_RPC),
            { speed: RELAYER_SPEED },
        ) as unknown as Signer;

        return {
            web3: new Web3(provider),
            txServiceUrl: SAFE_TXS_SERVICE,
            ethAdapter: new EthersAdapter({
                ethers,
                signerOrProvider: signer as any,
            }),
            signer,
            relayer,
            defaultAccount: POLYGON_RELAYER,
        };
    })();
}

export function getProvider(chainId?: ChainId) {
    if (!chainId) chainId = ContractService.getChainId();
    if (!networks[chainId]) throw new Error(`Network with chainId ${chainId} is not available`);
    return networks[chainId];
}

export const recoverSigner = (message: string, sig: string) => {
    return recoverAddress(hashMessage(message), sig);
};

export function getSelectors(contract: Contract) {
    const signatures: string[] = [];
    for (const sig of Object.keys(contract.methods)) {
        if (sig.indexOf('(') === -1) continue; // Only add selectors for full function signatures.
        signatures.push(web3.eth.abi.encodeFunctionSignature(sig));
    }
    return signatures;
}
