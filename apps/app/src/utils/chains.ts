import ImgLogoEthereum from '../assets/thx_logo_ethereum.svg';
import ImgLogoArbitrum from '../assets/thx_logo_arbitrum.svg';
import ImgLogoBinanceSmartChain from '../assets/thx_logo_bsc.svg';
import ImgLogoPolygon from '../assets/thx_logo_polygon.svg';
import ImgLogoHardhat from '../assets/thx_logo_hardhat.svg';
import ImgLogoLinea from '../assets/thx_logo_linea.svg';
import ImgLogoMetis from '../assets/thx_logo_metis.svg';
import ImgLogoBase from '../assets/thx_logo_base.svg';
import ImgLogoIOTA from '../assets/thx_logo_iota.svg';
import { arbitrum, mainnet, bsc, polygon, hardhat, polygonZkEvm, linea, metis, base } from '@wagmi/core/chains';
import { ChainId } from '@thxnetwork/common/enums';
import { PROD } from '../config/secrets';
import { defineChain } from 'viem';

const iota = defineChain({
    id: ChainId.IOTA,
    name: 'IOTA EVM',
    nativeCurrency: { name: 'IOTA', symbol: 'IOTA', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://json-rpc.evm.iotaledger.net'] },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://explorer.evm.iota.org' },
    },
    contracts: {},
});

const chainList: { [chainId: number]: ChainInfo } = {
    [ChainId.Ethereum]: {
        chainId: ChainId.Ethereum,
        name: 'Ethereum',
        logo: ImgLogoEthereum,
        blockExplorer: 'https://etherscan.com',
        chain: mainnet,
    },
    [ChainId.BNBChain]: {
        chainId: ChainId.BNBChain,
        name: 'BNB Chain',
        logo: ImgLogoBinanceSmartChain,
        blockExplorer: 'https://bscscan.com',
        chain: bsc,
    },
    [ChainId.Arbitrum]: {
        chainId: ChainId.Arbitrum,
        name: 'Arbitrum',
        logo: ImgLogoArbitrum,
        blockExplorer: 'https://arbiscan.io',
        chain: arbitrum,
    },
    [ChainId.Polygon]: {
        chainId: ChainId.Polygon,
        name: 'Polygon',
        logo: ImgLogoPolygon,
        blockExplorer: 'https://polygonscan.com',
        chain: polygon,
    },
    [ChainId.PolygonZK]: {
        chainId: ChainId.PolygonZK,
        name: 'Polygon zkEVM',
        logo: ImgLogoPolygon,
        blockExplorer: 'https://zkevm.polygonscan.com',
        chain: polygonZkEvm,
    },
    [ChainId.Linea]: {
        chainId: ChainId.Linea,
        name: 'Linea',
        logo: ImgLogoLinea,
        blockExplorer: 'https://lineascan.build',
        chain: linea,
    },
    [ChainId.Metis]: {
        chainId: ChainId.Metis,
        name: 'Metis',
        logo: ImgLogoMetis,
        blockExplorer: 'https://explorer.metis.io',
        chain: metis,
    },
    [ChainId.Base]: {
        chainId: ChainId.Base,
        name: 'Base',
        logo: ImgLogoBase,
        blockExplorer: 'https://basescan.org',
        chain: base,
    },
    [ChainId.IOTA]: {
        chainId: ChainId.IOTA,
        name: 'IOTA',
        logo: ImgLogoIOTA,
        blockExplorer: 'https://explorer.evm.iota.org',
        chain: iota,
    },
};

if (PROD) {
    chainList[ChainId.Hardhat] = {
        chainId: ChainId.Hardhat,
        name: 'Hardhat',
        logo: ImgLogoHardhat,
        blockExplorer: 'https://hardhatscan.com',
        chain: hardhat,
    };
}

function getTokenURL(chainId: ChainId, address: string) {
    return `${chainList[chainId].blockExplorer}/token/${address}`;
}

function getAddressURL(chainId: ChainId, address: string) {
    return `${chainList[chainId].blockExplorer}/address/${address}`;
}

export { chainList, getTokenURL, getAddressURL };
