interface IERC20 {
    balance: number;
    symbol: string;
    name: string;
    logoImg: string;
}
interface IReward {
    amount: number;
    title: string;
    description: string;
    variant: number;
    component?: string;
}
interface IState {
    erc20s: IERC20[];
    rewards: IReward[];
}
