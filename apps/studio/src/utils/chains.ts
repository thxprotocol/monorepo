import { ChainId } from '@thxnetwork/common/enums';
import imgLogoHardhat from '@thxnetwork/studio/assets/logo_hardhat.svg';
import imgLogoLinea from '@thxnetwork/studio/assets/logo_linea.svg';
import imgLogoMetis from '@thxnetwork/studio/assets/logo_metis.svg';
import imgLogoPolygon from '@thxnetwork/studio/assets/logo_polygon.svg';

export const chainInfo: Record<
    number,
    {
        chainId: ChainId;
        name: string;
        logo: string;
        blockExplorer: string;
        safeURL: string;
    }
> = {
    [ChainId.Polygon]: {
        chainId: ChainId.Polygon,
        name: 'Polygon',
        logo: imgLogoPolygon,
        blockExplorer: 'https://polygonscan.com',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Linea]: {
        chainId: ChainId.Linea,
        name: 'Linea',
        logo: imgLogoLinea,
        blockExplorer: 'https://lineascan.build',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Metis]: {
        chainId: ChainId.Metis,
        name: 'Metis',
        logo: imgLogoMetis,
        blockExplorer: 'https://explorer.metis.io',
        safeURL: 'https://app.safe.global',
    },
    [ChainId.Hardhat]: {
        chainId: ChainId.Hardhat,
        name: 'Hardhat',
        logo: imgLogoHardhat,
        blockExplorer: 'https://etherscan.io',
        safeURL: 'https://app.safe.global',
    },
};
