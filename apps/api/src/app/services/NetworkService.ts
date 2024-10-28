import { Relayer } from '@openzeppelin/defender-relay-client';
import { DefenderRelaySigner } from '@openzeppelin/defender-relay-client/lib/ethers';
import { DefenderRelayProvider } from '@openzeppelin/defender-relay-client/lib/web3';
import { EthersAdapter } from '@safe-global/protocol-kit';
import {
    HARDHAT_RPC,
    LINEA_RELAYER,
    LINEA_RELAYER_API_KEY,
    LINEA_RELAYER_API_SECRET,
    LINEA_RPC,
    METIS_RELAYER,
    METIS_RELAYER_API_KEY,
    METIS_RELAYER_API_SECRET,
    METIS_RPC,
    POLYGON_RELAYER,
    POLYGON_RELAYER_API_KEY,
    POLYGON_RELAYER_API_SECRET,
    POLYGON_RPC,
    PRIVATE_KEY,
    RELAYER_SPEED,
    SAFE_TXS_SERVICE,
} from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/common/enums';
import { ethers, Wallet } from 'ethers';
import { hashMessage, recoverAddress } from 'ethers/lib/utils';
import Web3 from 'web3';

class NetworkService {
    config = {
        networks: [
            {
                chainId: ChainId.Linea,
                defaultAccount: LINEA_RELAYER,
                rpc: LINEA_RPC,
                relayer: { apiKey: LINEA_RELAYER_API_KEY, apiSecret: LINEA_RELAYER_API_SECRET },
                txServiceUrl: 'https://safe-transaction-linea.safe.global',
            },
            {
                chainId: ChainId.Polygon,
                defaultAccount: POLYGON_RELAYER,
                rpc: POLYGON_RPC,
                relayer: { apiKey: POLYGON_RELAYER_API_KEY, apiSecret: POLYGON_RELAYER_API_SECRET },
                txServiceUrl: 'https://safe-transaction-polygon.safe.global',
            },
            {
                chainId: ChainId.Metis,
                defaultAccount: METIS_RELAYER,
                rpc: METIS_RPC,
                relayer: { apiKey: METIS_RELAYER_API_KEY, apiSecret: METIS_RELAYER_API_SECRET },
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
                    { name: 'setAutomine', call: 'evm_setAutomine' },
                    { name: 'setIntervalMining', call: 'evm_setIntervalMining' },
                ],
            });
            const provider = new ethers.providers.JsonRpcProvider(HARDHAT_RPC);
            const signer = new Wallet(PRIVATE_KEY, provider);
            const defaultAccount = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY).address;
            this.networks[ChainId.Hardhat] = {
                rpc: HARDHAT_RPC,
                web3,
                provider,
                signer,
                ethAdapter: new EthersAdapter({ ethers, signerOrProvider: signer }),
                defaultAccount,
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
        if (!apiKey || !apiSecret) return;

        const provider = new DefenderRelayProvider({ apiKey, apiSecret }, { speed: RELAYER_SPEED });
        const relayer = new Relayer({ apiKey, apiSecret });
        const signer = new DefenderRelaySigner(
            { apiKey, apiSecret },
            new ethers.providers.JsonRpcProvider(options.rpc),
            { speed: RELAYER_SPEED },
        );
        this.networks[options.chainId] = {
            rpc: options.rpc,
            web3: new Web3(provider as any),
            ethAdapter: new EthersAdapter({ ethers, signerOrProvider: signer }),
            signer,
            defaultAccount: options.defaultAccount,
            txServiceUrl: options.txServiceUrl,
            relayer,
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
