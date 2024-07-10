import {
    HARDHAT_RPC,
    POLYGON_RELAYER,
    POLYGON_RELAYER_API_KEY,
    POLYGON_RELAYER_API_SECRET,
    POLYGON_RPC,
    LINEA_RELAYER,
    LINEA_RELAYER_API_KEY,
    LINEA_RELAYER_API_SECRET,
    LINEA_RPC,
    PRIVATE_KEY,
    RELAYER_SPEED,
    SAFE_TXS_SERVICE,
} from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import { ethers, Wallet } from 'ethers';
import { recoverAddress, hashMessage } from 'ethers/lib/utils';
import { EthersAdapter } from '@safe-global/protocol-kit';
import { DefenderRelaySigner } from '@openzeppelin/defender-relay-client/lib/ethers';
import { Relayer } from '@openzeppelin/defender-relay-client';
import { DefenderRelayProvider } from '@openzeppelin/defender-relay-client/lib/web3';
import { ChainId } from '@thxnetwork/common/enums';

class NetworkService {
    config = {
        networks: [
            {
                chainId: ChainId.Linea,
                defaultAccount: LINEA_RELAYER,
                rpc: LINEA_RPC,
                relayer: { apiKey: LINEA_RELAYER_API_KEY, apiSecret: LINEA_RELAYER_API_SECRET },
                txServiceUrl: 'https://gateway.safe.linea.build',
            },
            {
                chainId: ChainId.Polygon,
                defaultAccount: POLYGON_RELAYER,
                rpc: POLYGON_RPC,
                relayer: { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET },
                txServiceUrl: 'https://safe-transaction-polygon.safe.global',
            },
        ],
    };
    networks: { [chainId: number]: TNetworkConfig } = {};

    constructor() {
        // If the hardhat rpc is set in the environment, we provide it as a network
        if (HARDHAT_RPC) {
            const web3 = new Web3(HARDHAT_RPC);
            web3.extend({
                property: 'hardhat',
                methods: [
                    { name: 'setAutomine', call: 'evm_setAutomine', params: 1 },
                    { name: 'setIntervalMining', call: 'evm_setIntervalMining', params: 1 },
                ],
            });

            const signer = new Wallet(PRIVATE_KEY, new ethers.providers.JsonRpcProvider(HARDHAT_RPC));
            this.networks[ChainId.Hardhat] = {
                web3,
                ethAdapter: new EthersAdapter({ ethers, signerOrProvider: signer as any }),
                signer,
                defaultAccount: web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY).address,
                txServiceUrl: SAFE_TXS_SERVICE,
            };
        }

        // Provides all other configured networks for this service
        for (const network of this.config.networks) {
            this.setNetwork(network);
        }
    }

    setNetwork(options: {
        chainId: ChainId;
        defaultAccount: string;
        rpc: string;
        relayer: { apiKey: string; apiSecret: string };
        txServiceUrl: string;
    }) {
        if (!options.rpc) return;

        const { apiKey, apiSecret } = options.relayer;
        const provider = new DefenderRelayProvider({ apiKey, apiSecret }, { speed: RELAYER_SPEED });
        const relayer = new Relayer({ apiKey, apiSecret });
        const signer = new DefenderRelaySigner(
            { apiKey, apiSecret },
            new ethers.providers.JsonRpcProvider(options.rpc),
            { speed: RELAYER_SPEED },
        ) as unknown as Wallet;

        const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer as any });

        this.networks[options.chainId] = {
            web3: new Web3(provider),
            ethAdapter,
            signer,
            relayer,
            defaultAccount: options.defaultAccount,
            txServiceUrl: options.txServiceUrl,
        };
    }

    getProvider(chainId: ChainId) {
        if (!this.networks[chainId]) throw new Error(`Network with chainId ${chainId} is not available`);
        return this.networks[chainId];
    }

    recoverSigner = (message: string, sig: string) => {
        return recoverAddress(hashMessage(message), sig);
    };
}

export default new NetworkService();
