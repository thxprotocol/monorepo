import ImgLogoEthereum from '../assets/thx_logo_ethereum.svg';
import ImgLogoArbitrum from '../assets/thx_logo_arbitrum.svg';
import ImgLogoBinanceSmartChain from '../assets/thx_logo_bsc.svg';
import ImgLogoPolygon from '../assets/thx_logo_polygon.svg';
import ImgLogoHardhat from '../assets/thx_logo_hardhat.svg';
import ImgLogoLinea from '../assets/thx_logo_linea.svg';
import { arbitrum, mainnet, bsc, polygon, hardhat, polygonZkEvm, linea } from '@wagmi/core/chains';
import { ChainId } from '@thxnetwork/common/enums';

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
        blockExplorer: 'https://zkevm.polygonscan.com',
        chain: linea,
    },
};

if (process.env.NODE_ENV !== 'production') {
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
