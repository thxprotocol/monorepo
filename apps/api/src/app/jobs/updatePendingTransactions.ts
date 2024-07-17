import { TransactionState, TransactionType } from '@thxnetwork/common/enums';
import { Transaction, TransactionDocument } from '@thxnetwork/api/models/Transaction';
import { Wallet } from '../models/Wallet';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import SafeService from '../services/SafeService';
import { logger } from '../util/logger';

export async function updatePendingTransactions() {
    const transactions: TransactionDocument[] = await Transaction.find({
        $or: [{ state: TransactionState.Confirmed }, { state: TransactionState.Sent }],
    }).sort({ createdAt: 'asc' });

    // Iterate over all tx sent to or proposed and confirmed by the relayer
    for (const tx of transactions) {
        try {
            switch (tx.state) {
                // Legacy tx will not have this state
                // Transactions is proposed and confirmed by the relayer, awaiting user wallet confirmation
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
                // TransactionType.Default is handled in tx service send methods
                case TransactionState.Sent: {
                    if (tx.type == TransactionType.Relayed) {
                        logger.debug(`Checking status for tx: ${tx.transactionHash}`);
                        await TransactionService.queryTransactionStatusReceipt(tx).catch((error) =>
                            console.error(error),
                        );
                    }
                    break;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}
