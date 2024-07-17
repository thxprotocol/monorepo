import { TransactionState, TransactionType } from '@thxnetwork/common/enums';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { Wallet } from '../models/Wallet';
import { logger } from '../util/logger';
import SafeService from '../services/SafeService';

export async function updatePendingTransactions() {
    const transactions: TransactionDocument[] = await Transaction.find({
        $or: [{ state: TransactionState.Confirmed }, { state: TransactionState.Sent }],
    }).sort({ createdAt: 'asc' });

    // Iterate over all tx sent to or proposed and confirmed by the relayer
    for (const tx of transactions) {
        try {
            switch (tx.state) {
                case TransactionState.Confirmed: {
                    if (!tx.walletId) continue;

                    const wallet = await Wallet.findById(tx.walletId);

                    try {
                        await SafeService.executeTransaction(wallet, tx);
                    } catch (error) {
                        console.debug(error);
                        await tx.updateOne({ state: TransactionState.Failed });
                        console.error(
                            'Error executing transaction:',
                            error.response ? error.response.data : error.message,
                        );
                    }

                    break;
                }
                case TransactionState.Sent: {
                    if (tx.type == TransactionType.Relayed) {
                        logger.debug(`Update transaction: ${tx.transactionHash}`);
                        const wallet = await Wallet.findById(tx.walletId);
                        await SafeService.updateTransactionState(wallet, tx.safeTxHash);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
