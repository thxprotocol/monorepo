import { RewardCoin, Wallet } from '@thxnetwork/api/models';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';

export default async function main() {
    // const reward = await RewardCoin.findById('669126e1110e00291909e0e3'); // Polygon Reward
    // const reward = await RewardCoin.findById('66952d939a90f7280b2d3164'); // Linea Reward
    const reward = await RewardCoin.findById('6697e0dabb71534919450a75'); // Linea Reward
    const wallet = await Wallet.findById('669663d3845cc6922363e7e9');
    const service = new RewardCoinService();

    await service.createPayment({
        reward,
        wallet,
    });
}
