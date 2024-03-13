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
        simulateTxAccessorAddress: '0x',
        // Tokens
        BPT: '0xc368fA6A4057BcFD9E49221d8354d5fA6B88945a',
        BPTGauge: '0x439F0128d07f005e0703602f366599ACaaBfEA18',
        BAL: '0x24E91C3a2822bDc4bc73512872ab07fD93c8101b',
        USDC: '0x7Cb8d1EAd6303C079c501e93F3ba28C227cd7000',
        THX: '0x76aBe9ec9b15947ba1Ca910695B8b6CffeD8E6CA',
        // veTHX
        VotingEscrow: '0xde46F6e0F666A42536e1AeD3d5Efa081089d4491',
        RewardDistributor: '0x09884893517b396DA808E5165b33091bAe866401',
    },
    '137': {
        // Tokens
        BPT: '0xb204bf10bc3a5435017d3db247f56da601dfe08a',
        BPTGauge: '0xf16BECC1Bcaf0fF0b865024a644a4da1A2f8585c',
        BAL: '0x9a71012B13CA4d3D0Cdc72A177DF3ef03b0E76A3',
        USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        THX: '0x2934b36ca9a4b31e633c5be670c8c8b28b6aa015',
        // veTHX
        VotingEscrow: '0xE3B8E734e7BCcB64B63e032795896CC57012A51D',
        RewardDistributor: '0xCc62c812EfF9cA4c35623103B2Bb63E22f465E09',
    },
};
