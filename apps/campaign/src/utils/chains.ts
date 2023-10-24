import ImgLogoEthereum from '../assets/thx_logo_ethereum.svg';
import ImgLogoArbitrum from '../assets/thx_logo_arbitrum.svg';
import ImgLogoBinanceSmartChain from '../assets/thx_logo_bsc.svg';
import ImgLogoPolygon from '../assets/thx_logo_polygon.svg';
import ImgLogoHardhat from '../assets/thx_logo_hardhat.svg';
import { arbitrum, mainnet, bsc, polygon, hardhat } from '@wagmi/core/chains';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';

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
