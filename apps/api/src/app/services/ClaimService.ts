import { QRCodeEntry } from '@thxnetwork/api/models';
import { v4 } from 'uuid';

export default class QRCodeService {
    static create(data: Partial<TQRCodeEntry>, claimAmount: number) {
        if (!claimAmount) return;
        return QRCodeEntry.create(Array.from({ length: Number(claimAmount) }).map(() => ({ uuid: v4(), ...data })));
    }

    static findByReward(reward: TRewardNFT, page: number, limit: number) {
        //
    }
}
