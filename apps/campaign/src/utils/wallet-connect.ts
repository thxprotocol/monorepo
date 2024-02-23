// import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
// import { Web3Modal } from '@web3modal/html';
// import { Chain, configureChains, createConfig } from '@wagmi/core';
// import { WALLET_CONNECT_PROJECT_ID } from '../config/secrets';

// const projectId = WALLET_CONNECT_PROJECT_ID;

// const getModal = (defaultChain: Chain, chains: Chain[], theme?: any) => {
//     const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
//     const wagmiConfig = createConfig({
//         autoConnect: false,
//         connectors: w3mConnectors({ projectId, chains }),
//         publicClient,
//     });
//     const ethereumClient = new EthereumClient(wagmiConfig, chains);
//     return new Web3Modal(
//         {
//             projectId,
//             defaultChain,
//             enableAccountView: false,
//             enableExplorer: false,
//             themeMode: 'dark',
//             privacyPolicyUrl: '',
//             termsOfServiceUrl: '',
//             themeVariables:
//                 theme &&
//                 ({
//                     '--w3m-font-family': '"Exo 2", sans-serif',
//                     '--w3m-accent-color': theme.elements['btnBg'].color,
//                     '--w3m-color-bg-1': theme.elements['bodyBg'].color,
//                     '--w3m-color-fg-1': theme.elements['text'].color,
//                     '--w3m-background-color': theme.elements['cardBg'].color,
//                     '--w3m-accent-fill-color': theme.elements['cardText'].color,
//                     '--w3m-container-border-radius': '0',
//                     '--w3m-background-border-radius': '0',
//                     '--w3m-icon-button-border-radius': '5px',
//                 } as any),
//         },
//         ethereumClient,
//     );
// };

// export { getModal };
