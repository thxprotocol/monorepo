import VotingEscrow from './VotingEscrow.json';

const ERC20 = {
    abi: [
        {
            inputs: [
                { name: 'spender', type: 'address' },
                { name: 'amount', type: 'uint256' },
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'public',
            type: 'function',
        },
    ],
};

const BPTGauge = {
    abi: [
        {
            stateMutability: 'nonpayable',
            type: 'function',
            name: 'deposit',
            inputs: [
                {
                    name: '_value',
                    type: 'uint256',
                },
            ],
            outputs: [],
        },
    ],
};

const BalancerVault = {
    abi: [
        {
            inputs: [
                {
                    internalType: 'bytes32',
                    name: 'poolId',
                    type: 'bytes32',
                },
                {
                    internalType: 'address',
                    name: 'sender',
                    type: 'address',
                },
                {
                    internalType: 'address',
                    name: 'recipient',
                    type: 'address',
                },
                {
                    components: [
                        {
                            internalType: 'address[]',
                            name: 'assets',
                            type: 'address[]',
                        },
                        {
                            internalType: 'uint256[]',
                            name: 'maxAmountsIn',
                            type: 'uint256[]',
                        },
                        {
                            internalType: 'bytes',
                            name: 'userData',
                            type: 'bytes',
                        },
                        {
                            internalType: 'bool',
                            name: 'fromInternalBalance',
                            type: 'bool',
                        },
                    ],
                    internalType: 'struct BalancerVault.JoinPoolRequest',
                    name: 'request',
                    type: 'tuple',
                },
            ],
            name: 'joinPool',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

const RewardDistributor = {
    abi: [
        {
            inputs: [
                {
                    internalType: 'address',
                    name: 'user',
                    type: 'address',
                },
                {
                    internalType: 'contract IERC20[]',
                    name: 'tokens',
                    type: 'address[]',
                },
            ],
            name: 'claimTokens',
            outputs: [
                {
                    internalType: 'uint256[]',
                    name: '',
                    type: 'uint256[]',
                },
            ],
            stateMutability: 'nonpayable',
            type: 'function',
        },
    ],
};

export const abi = {
    VotingEscrow: VotingEscrow.abi,
    RewardDistributor: RewardDistributor.abi,
    BalancerVault: BalancerVault.abi,
    BPTGauge: BPTGauge.abi,
    ERC20: ERC20.abi,
};
