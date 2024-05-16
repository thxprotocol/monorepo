import { AbiItem } from 'web3-utils';
import { ContractNetworksConfig } from '@safe-global/protocol-kit';

import Launchpad from './abis/Launchpad.json';
import VotingEscrow from './abis/VotingEscrow.json';
import RewardDistributor from './abis/RewardDistributor.json';
import SmartWalletWhitelist from './abis/SmartWalletWhitelist.json';
import RewardFaucet from './abis/RewardFaucet.json';
import LensReward from './abis/LensReward.json';
import BalMinter from './abis/BalancerMinter.json';
import BPT from './abis/BPT.json';
import BPTGauge from './abis/BPTGauge.json';
import BAL from './abis/BAL.json';
import THX from './abis/THX.json';
import USDC from './abis/USDC.json';
import BalancerVault from './abis/BalancerVault.json';
import BalancerGaugeController from './abis/BalancerGaugeController.json';
import THXRegistry from './abis/THXRegistry.json';
import THXPaymentSplitter from './abis/THXPaymentSplitter.json';

export const contractNetworks = {
    '31337': {
        // Safe
        simulateTxAccessorAddress: '0xB952d9b5de7804691e7936E88915A669B15822ef',
        safeProxyFactoryAddress: '0x50aF0922d65D04D87d810048Dc640E2474eBfbd9',
        fallbackHandlerAddress: '0x278Ff6d33826D906070eE938CDc9788003749e93',
        createCallAddress: '0xEAB9a65eB0F098f822033192802B53EE159De5F0',
        multiSendAddress: '0x15FC0878406CcF4d2963235A5B1EF68C67F17Ee5',
        multiSendCallOnlyAddress: '0xa4E84979c95cD4f12C53E73d63E0A8634A1f44Ae',
        signMessageLibAddress: '0xd916a690676e925Ac9Faf2d01869c13Fd9757ef2',
        safeMasterCopyAddress: '0xb63564A81D5d4004F4f22E9aB074cE25540B0C26',

        // Tokens
        THX: '0xf228ADAa4c3D07C8285C1025421afe2c4F320C59',
        USDC: '0x8613B8E442219e4349fa5602C69431131a7ED114',
        BAL: '0x7150A3CC09429583471020A6CE5228A57736180a',
        BPT: '0xe1c01805a21ee0DC535afa93172a5F21CE160649',
        BPTGauge: '0x8B219D3d1FC64e03F6cF3491E7C7A732bF253EC8',
        BalancerVault: '0xeDdBA2bDeE7c9006944aCF9379Daa64478E02290',

        // veTHX
        VotingEscrow: '0xdb8549fdb720C35b926fC3fFF2FfBec61383E994',
        RewardDistributor: '0xD98E8ac8D53e3330b5DBc3425FB178810128A9e5',
        RewardFaucet: '0x3e3B1997c3Bc3Cf512359EEa6d9cAd19394D51B4',
        SmartWalletWhitelist: '0x774442713f32fa98bf27bEc78c96fb7186f7C223',
        LensReward: '0xb2Bea6009625407C3c3cF7158185125Ed2C7f101',

        // Company
        THXRegistry: '0xa4cBDae70871E8664b8de077765DDA2f4cc90d02',
        THXPaymentSplitter: '0xe42CA31C24ee6bA76DBd87D86ab66D45b65ee5A2',
        CompanyMultiSig: '0xaf9d56684466fcFcEA0a2B7fC137AB864d642946',
    },
    '137': {
        // Tokens
        BPT: '0xb204BF10bc3a5435017D3db247f56dA601dFe08A',
        BPTGauge: '0xf16BECC1Bcaf0fF0b865024a644a4da1A2f8585c',
        BalancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
        BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        THX: '0x2934b36ca9A4B31E633C5BE670C8C8b28b6aA015',

        // veTHX
        VotingEscrow: '0xE3B8E734e7BCcB64B63e032795896CC57012A51D',
        RewardDistributor: '0xCc62c812EfF9cA4c35623103B2Bb63E22f465E09',
        RewardFaucet: '0xA1D7671f73FbcB5e079d4dC4Cffb7dDD0967EA7E',
        SmartWalletWhitelist: '0x876625a92cEAa7f1Bddd40908B8eb5C6080cB83C',
        LensReward: '0xE8D9624E0B7f839540E7c13577550E3Eff3FC8aA',

        // Company
        THXRegistry: '',
        THXPaymentSplitter: '',
        CompanyMultiSig: '0x0b8e0aAF940cc99EDA5DA5Ab0a8d6Ed798eDc08A',
    },
    '1': {
        BalancerGaugeController: '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD',
        BalancerRootGauge: '0x9902913ce5439d667774c8f9526064b2bc103b4a',
    },
} as ContractNetworksConfig & any;

export const contractArtifacts: { [contractName: string]: { abi: any; bytecode: string } } = {
    RewardFaucet,
    RewardDistributor,
    SmartWalletWhitelist,
    Launchpad,
    LensReward,
    BalMinter,
    VotingEscrow,
    BalancerVault,
    BalancerGaugeController,
    BPT,
    BPTGauge,
    USDC,
    THX,
    BAL,
    THXRegistry,
    THXPaymentSplitter,
};

export const contractNames = ['BalancerVault'] as const;
export const tokenContractNames = [
    'LimitedSupplyToken',
    'UnlimitedSupplyToken',
    'NonFungibleToken',
    'UnlimitedSupplyToken',
    'THX_ERC1155',
    'VotingEscrow',
    'BPT',
    'BPTGauge',
    'USDC',
    'THX',
    'BAL',
    'THXPaymentSplitter',
] as const;
export type TokenContractName = (typeof tokenContractNames)[number];

export interface ContractConfig {
    address: string;
    abi: AbiItem[];
    bytecode: string;
}
