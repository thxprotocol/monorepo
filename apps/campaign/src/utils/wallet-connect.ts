import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';
import { Chain, configureChains, createConfig } from '@wagmi/core';
import { WALLET_CONNECT_PROJECT_ID } from '../config/secrets';

const projectId = WALLET_CONNECT_PROJECT_ID;

const getModal = (defaultChain: Chain, chains: Chain[]) => {
    const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
    const wagmiConfig = createConfig({
        autoConnect: false,
        connectors: w3mConnectors({ projectId, chains }),
        publicClient,
    });
    const ethereumClient = new EthereumClient(wagmiConfig, chains);
    return new Web3Modal(
        {
            projectId,
            defaultChain,
            enableAccountView: false,
            enableExplorer: false,
            themeMode: 'dark',
            privacyPolicyUrl: '',
            termsOfServiceUrl: '',
            themeVariables: {
                '--w3m-accent-color': 'var(--thx-accent)',
                '--w3m-container-border-radius': '0',
                '--w3m-background-border-radius': '0',
                '--w3m-background-color': 'var(--bs-primary)',
            },
        },
        ethereumClient,
    );
};

export { getModal };
