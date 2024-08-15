import { RewardCoin, RewardNFT, Wallet } from '@thxnetwork/api/models';
import RewardCoinService from '@thxnetwork/api/services/RewardCoinService';
import RewardNFTService from '@thxnetwork/api/services/RewardNFTService';

export default async function main() {
    const rewardNFT = await RewardNFT.findById('6698d1ac152436b397589f22'); // Linea NFT Reward
    const rewardNFT2 = await RewardNFT.findById('66bb44b67b9792820c9c4a1f'); // Polygon NFT Reward
    const rewardCoin = await RewardCoin.findById('669b6b428db8703ee75bcc7d'); // Linea Coin Reward
    const receiver = await Wallet.findById('669805738c683b6c4c506e97'); // peter@thx.network sso

    await Promise.all([
        ...Array.from({ length: 5 }).map(() =>
            new RewardCoinService().createPayment({
                reward: rewardCoin,
                wallet: receiver,
            }),
        ),
        ...Array.from({ length: 3 }).map(() =>
            new RewardNFTService().createPayment({
                reward: rewardNFT,
                wallet: receiver,
            }),
        ),
        ...Array.from({ length: 3 }).map(() =>
            new RewardNFTService().createPayment({
                reward: rewardNFT2,
                wallet: receiver,
            }),
        ),
    ]);
}
