import { RewardCoin, Wallet } from '@thxnetwork/api/models';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';

export default async function main() {
    // const reward = await RewardCoin.findById('669126e1110e00291909e0e3'); // Polygon Reward
    const reward = await RewardCoin.findById('66952d939a90f7280b2d3164'); // Linea Reward
    const wallet = await Wallet.findById('6694e258e63b88b201f75bd4');
    const service = new RewardCoinService();

    await service.createPayment({
        reward,
        wallet,
    });
}
