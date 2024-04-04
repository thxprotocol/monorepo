export const BALANCER_POOL_ID = '0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe';
export const MAX_LOCK_TIME = 7776000;
export const BREAKPOINT_LG = 992;

// Safe Contracts
export const contractNetworks: any = {
    '31337': {
        safeMasterCopyAddress: '0xC44951780f195Ed71145e3d0d2F25726A097C348',
        safeProxyFactoryAddress: '0x1122fD9eBB2a8E7c181Cc77705d2B4cA5D72988A',
        multiSendAddress: '0x7E4728eFfC9376CC7C0EfBCc779cC9833D83a984',
        multiSendCallOnlyAddress: '0x75Cbb6C4Db4Bb4f6F8D5F56072A6cF4Bf4C5413C',
        fallbackHandlerAddress: '0x5D3D550Da6678C0444F5D77Ca086678D9CdeEecA',
        signMessageLibAddress: '0x658FAD2acB6d1E615f295E566ee9a6d32Cc97b10',
        createCallAddress: '0x40Efd8a16485213445E6d8b9a4266Fd2dFf7C69a',
        simulateTxAccessorAddress: '0xFF1eE64b8806C0891e8F73b37f8403F441b552E1',
        // Tokens
        THX: '0xc368fA6A4057BcFD9E49221d8354d5fA6B88945a',
        USDC: '0x439F0128d07f005e0703602f366599ACaaBfEA18',
        BAL: '0x24E91C3a2822bDc4bc73512872ab07fD93c8101b',
        BPT: '0x76aBe9ec9b15947ba1Ca910695B8b6CffeD8E6CA',
        BPTGauge: '0x7Cb8d1EAd6303C079c501e93F3ba28C227cd7000',
        BalancerVault: '0xb3B2b0fc5ce12aE58EEb13E19547Eb2Dd61A79D5',

        // veTHX
        VotingEscrow: '0xe3C1Fda814032919F7CE63D9c3cd5C0F9a579d1A',
        RewardDistributor: '0xf0Ac139fD5362E2823667c7F9dD7238b020D44EC',
        RewardFaucet: '0x879E73B20973d78c55b5B07566A3355327Db47bd',
        SmartWalletWhitelist: '0xD4702511e43E2b778b34185A59728B57bE61aEd1',
        LensReward: '0x36260689483bc55753E3258725f31E8aee31A7B0',
    },
    '137': {
        // Tokens
        THX: '0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015',
        USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
        BPT: '0xb204bf10bc3a5435017d3db247f56da601dfe08a',
        BPTGauge: '0xf16BECC1Bcaf0fF0b865024a644a4da1A2f8585c',
        BalancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',

        // veTHX
        VotingEscrow: '0xE3B8E734e7BCcB64B63e032795896CC57012A51D',
        RewardDistributor: '0xCc62c812EfF9cA4c35623103B2Bb63E22f465E09',
    },
};
